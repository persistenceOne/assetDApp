import React, {useState, useEffect} from "react";
import Identities from "persistencejs/transaction/identity/query";
import Splits from "persistencejs/transaction/splits/query";
import AssetsQuery from "persistencejs/transaction/assets/query";
import Helpers from "../../utilities/helper";
import {Modal, Form, Button} from "react-bootstrap";

const Assets = () => {
    const Helper = new Helpers();
    const [assetList, setAssetList] = useState([]);
    const userAddress = localStorage.getItem('address');
    useEffect(() => {
        const fetchAssets = () => {
            const identities = Identities.queryIdentityWithID("all")
            identities.then(function (item) {
                const data = JSON.parse(item);
                const dataList = data.result.value.identities.value.list;
                const filterIdentities = Helper.FilterIdentitiesByProvisionedAddress(dataList, userAddress)
                const splits = Splits.querySplitsWithID("all")

                splits.then(function (splitsitem) {
                    const splitData = JSON.parse(splitsitem);
                    const splitList = splitData.result.value.splits.value.list;
                    if(splitList){
                    const filterSplitsByIdentities = Helper.FilterSplitsByIdentity(filterIdentities, splitList)
                    const ownableIdList = Helper.GetIdentityOwnableId(filterSplitsByIdentities)
                    ownableIdList.forEach((ownalbeId) => {
                        const filterAssetList = AssetsQuery.queryAssetWithID(ownalbeId);
                        filterAssetList.then(function (Asset) {
                            const parsedAsset = JSON.parse(Asset);
                            if(parsedAsset.result.value.assets.value.list.length > 0){
                            const propertyList = Helper.ParseProperties(parsedAsset.result.value.assets.value.list[0].value.immutables.value.properties.value.propertyList)
                            setAssetList((assetList) => [
                                ...assetList,
                                propertyList,
                            ]);
                        }
                    
                        })
                    })
                  } else{
                    console.log("no splits found")
                  }


                })
            })
        }
        fetchAssets();
    }, []);

    return (
        <div className="container">
            <div className="accountInfo">
                <div className="row row-cols-1 row-cols-md-2 card-deck createAccountSection">
                    <div className="col-md-6 custom-pad card">
                        {assetList.map((asset, index) => {
                            var keys = Object.keys(asset);
                            return keys.map((keyName) => {
                                return (<a key={index + keyName}>{keyName} {asset[keyName]}</a>)
                            })
                        })}
                    </div>
                </div>
                <Modal
                    className="accountInfoModel"
                    centered
                >
                    <Modal.Header>
                        <div className="icon failure-icon">
                            <i class="mdi mdi-close"></i>
                        </div>
                    </Modal.Header>
                    <Modal.Body>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary">
                            ok
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default Assets;
