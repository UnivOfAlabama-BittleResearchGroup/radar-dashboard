import json
from datetime import datetime
from pathlib import Path
from urllib.request import Request


from backend.data_handlers.radar_data import RadarData
from flask import Flask, jsonify, request
from flask_cors import CORS  # comment this on deployment

# from flask_restful import Api, Resource, reqparse
from pydantic import BaseModel

app = Flask(
    __name__, static_folder=Path(__file__).parent.parent / "build", static_url_path=""
)
CORS(app, resources=r"/api/*")  # comment this on deployment
# api = Api(app)


# open the configuration json file
with open(Path(__file__).parent / "config.json", "r") as f:
    config = json.load(f)

# create the data handlers. This is a dumb way to do this, but it works for now
# should probably use a factory pattern or something
radar_data = RadarData(**config['radar'])

# build a prototype class for the requests
class Query(BaseModel):
    startTime: datetime
    endTime: datetime


@app.route("/")
def main():
    # serve the index.html file from the static folder
    return app.send_static_file("index.html")


# add a route to serve post requests to the /gps endpoint
@app.route("/api/radar", methods=["POST"])
def gps():
    # get the data from the request
    q = Query.parse_obj(request.get_json())

    # this is a dumb api, why not just the same as the bookings one?
    trace_json = radar_data.get_traces(
        start_time=q.startTime, end_time=q.endTime
    )
    # return the geojson
    return app.make_response((trace_json, 200, {"Content-Type": "application/json"}))


if __name__ == "__main__":

    app.run(debug=True)
