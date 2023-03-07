from dataclasses import dataclass
from pathlib import Path

import polars as pl
import pandas as pd
import geopandas as gpd

import utm
import json


GROUPBY_EVERY = "1s"


# create a cache decorator that will cache the results of a function according to the arguments
def cache(func):
    cache = {}

    def wrapper(*args, **kwargs):
        if args in cache:
            return cache[args]
        res = func(*args, **kwargs)
        cache[args] = res
        return res

    return wrapper


@dataclass
class _DFHandler:
    file_root: Path
    _df: pl.DataFrame = None
    radar_utms: dict = None

    def __post_init__(self):
        self._load_df()

    def _load_df(self):
        df = pl.scan_parquet(Path(self.file_root).joinpath("*.parquet")).collect()
        df = df.with_columns(
            [
                (
                    pl.col("f32_positionX_m")
                    + pl.col("ip").apply(lambda ip: self.radar_utms[ip][0])
                ).alias("x"),
                (
                    pl.col("f32_positionY_m")
                    + pl.col("ip").apply(lambda ip: self.radar_utms[ip][1])
                ).alias("y"),
                (pl.col("ui32_objectID").cast(str) + "_" + pl.col("ip")).alias(
                    "object_id"
                ),
            ]
        )
        # self._df = df
        self._df = df.sort("epoch_time").groupby_dynamic(
            index_column="epoch_time",
            every=GROUPBY_EVERY,
            by=["object_id"],
        ).agg(
            [
                pl.col("x").mean().alias("x"),
                pl.col("y").mean().alias("y"),
                pl.col("f32_velocityInDir_mps").mean(),
                pl.col("ip").first(),
            ]
        )

    @property
    def df(self):
        return self._df


class RadarData:
    def __init__(self, directory, origins, *args, **kwargs) -> None:
        # probably don't need to save below as a class attribute, but going to for now
        # TODO: move this to a config file
        with open(origins) as f:
            radar_origins = json.load(f)

            radar_origins = {
                ip: utm.from_latlon(*radar_origins[ip]["origin"][::-1])
                for ip in radar_origins
            }

        # assert that all radar utm zones are the same
        assert len({(x[2], x[3]) for x in radar_origins.values()}) == 1

        self.radar_utm_zone = list(radar_origins.values())[0][2:4]

        # load the radar data and convert to utm
        self._df: _DFHandler = _DFHandler(file_root=directory, radar_utms=radar_origins)

    @cache
    def get_traces(
        self, start_time: pd.Timestamp, end_time: pd.Timestamp = None
    ) -> gpd.GeoDataFrame:
        if end_time is None:
            # make the end time 1 day after the start time
            end_time = start_time + pd.Timedelta(days=1)

        # get the data
        df = self._df.df.filter(pl.col("epoch_time").is_between(start_time, end_time))

        pd_df = df.to_pandas()
        x, y = utm.to_latlon(pd_df.x, pd_df.y, *self.radar_utm_zone)
        gdf = gpd.GeoDataFrame(
            pd_df, geometry=gpd.points_from_xy(x, y), crs="EPSG:4326"
        )

        # cast the epoch time to a string
        gdf["epoch_time"] = gdf["epoch_time"].dt.tz_localize("UTC").map(lambda x: x.isoformat())

        # convert the data to a geodataframe
        return gdf[["ip", "object_id", "geometry", "epoch_time"]].to_json()

    # def get_matching_velocity(
    #     self, device_id, start_time: pd.Timestamp, end_time: pd.Timestamp = None
    # ) -> List[dict]:

    #     if end_time is None:
    #         # make the end time 1 day after the start time
    #         end_time = start_time + pd.Timedelta(days=1)

    #     df = (
    #         self.df(device_id, start_time)
    #         .filter(pl.col("fixTime").is_between(start_time, end_time))[
    #             ["fixTime", "speed"]
    #         ]
    #         .to_pandas()
    #     )
    #     # sort by time
    #     df = df.sort_values("fixTime")

    #     # rename the columns to be time and velocity
    #     df.columns = ["time", "velocity"]

    #     df["time"] = df["time"].map(lambda x: x.isoformat())

    #     # convert the response to a flat list of records
    #     return df.to_dict("records")
