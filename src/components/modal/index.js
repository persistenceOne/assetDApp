import React, {useState} from 'react';
import {Modal} from "react-bootstrap";
import {useTranslation} from "react-i18next";

const ModalCommon = (props) => {
    const {t} = useTranslation();
    const [showIdentity, setShowIdentity] = useState(true);
    const handleClose = () => {
        setShowIdentity(false);
        props.handleClose();
        window.location.reload();
    };
    return (
        <Modal
            show={showIdentity}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton>
                {t("Result")}
            </Modal.Header>
            <Modal.Body>
                { props.keplrTxn ?
                    props.data.code ?
                        <p>Error: {props.data.rawLog}</p>
                        :
                        <p className="tx-hash">TxHash: <a href={process.env.REACT_APP_ASSET_MANTLE_API + '/txs/' + props.data.transactionHash} target="_blank" rel="noreferrer">{props.data.transactionHash}</a></p>
                    :
                    props.data.code ?
                        <p>Error: {props.data.rawLog}</p>
                        :
                        <p className="tx-hash">TxHash: <a href={process.env.REACT_APP_ASSET_MANTLE_API + '/txs/' + props.data.transactionHash} target="_blank" rel="noreferrer">{props.data.transactionHash}</a></p>

                }
            </Modal.Body>
        </Modal>

    );
};


export default ModalCommon;
