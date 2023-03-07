import React, {useState} from 'react';
import styles from './styles/SiteLayout.module.scss';

const SiteLayout = ({children}) => {
    return (
        <div className={styles.layout}>
            <div id='main' className={styles.main}>
                <div className={styles.layout_header}>
                    <h2 className={`${styles.layout_header_title}`}>
                        Radar Data Viewer
                    </h2>
                    {/* <div className={styles.layout_header_spacer} />
                    <img src={'/static/images/NS.svg'} className={styles.layout_header_image_ns} alt={'logo'}/>
                    <img src={'/static/images/hanson_logo.svg'} className={styles.layout_header_image} alt={'logo'}/> */}
                </div>
                <div className={styles.layout_content}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default SiteLayout;

// export const getLayout = page => <SiteLayout>{page}</SiteLayout>;
