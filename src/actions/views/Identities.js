import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import identitiesQueryJS from "persistencejs/transaction/identity/query";
import identitiesDefineJS from "persistencejs/transaction/identity/define";
import Helpers from "../../utilities/Helper";
import metasQueryJS from "persistencejs/transaction/meta/query";
import {Dropdown, Modal, Button} from "react-bootstrap";
import {Define} from "../forms";
import {Nub, IssueIdentity, Provision, UnProvision} from "../forms/identities";

const metasQuery = new metasQueryJS(process.env.REACT_APP_ASSET_MANTLE_API)
const identitiesQuery = new identitiesQueryJS(process.env.REACT_APP_ASSET_MANTLE_API)
const identitiesDefine = new identitiesDefineJS(process.env.REACT_APP_ASSET_MANTLE_API)

const Identities = () => {
    const Helper = new Helpers();
    const [showIdentity, setShowIdentity] = useState(false);
    const [externalComponent, setExternalComponent] = useState("");
    const [identityId, setIdentityId] = useState("");
    const [identity, setIdentity] = useState([]);
    const [filteredIdentitiesList, setFilteredIdentitiesList] = useState([]);
    const handleClose = () => {
        setShowIdentity(false);
    };
    const userAddress = localStorage.getItem('address');
    useEffect(() => {
        const fetchToIdentities = () => {
            const identities = identitiesQuery.queryIdentityWithID("all")
            identities.then(function (item) {
                const data = JSON.parse(item);
                const dataList = data.result.value.identities.value.list;
                if (dataList) {
                    const filterIdentities = Helper.FilterIdentitiesByProvisionedAddress(dataList, userAddress);
                    setFilteredIdentitiesList(filterIdentities);
                    filterIdentities.map((identity, index) => {
                        let immutableProperties = "";
                        let mutableProperties = "";
                        const identityId = Helper.GetIdentityID(identity)
                        if (identity.value.immutables.value.properties.value.propertyList !== null) {
                            immutableProperties = Helper.ParseProperties(identity.value.immutables.value.properties.value.propertyList);
                        }
                        if (identity.value.mutables.value.properties.value.propertyList !== null) {
                            mutableProperties = Helper.ParseProperties(identity.value.mutables.value.properties.value.propertyList);
                        }
                        let immutableKeys = Object.keys(immutableProperties);
                        let mutableKeys = Object.keys(mutableProperties);
                        immutableKeys.map((keyName, index1) => {
                            if (immutableProperties[keyName] !== "") {
                                const metaQueryResult = metasQuery.queryMetaWithID(immutableProperties[keyName]);
                                metaQueryResult.then(function (item) {
                                    const data = JSON.parse(item);
                                    let myElement = "";
                                    let metaValue = Helper.FetchMetaValue(data, immutableProperties[keyName])
                                    myElement = <span>{metaValue}</span>;
                                    ReactDOM.render(myElement, document.getElementById(`immutable_identityList` + index + `${index1}`));
                                });
                            }
                        })
                        mutableKeys.map((keyName, index1) => {
                            if (mutableProperties[keyName] !== "") {
                                const metaQueryResult = metasQuery.queryMetaWithID(mutableProperties[keyName]);
                                metaQueryResult.then(function (item) {
                                    const data = JSON.parse(item);
                                    let myElement = "";
                                    let metaValue = Helper.FetchMetaValue(data, mutableProperties[keyName])
                                    myElement = <span>{metaValue}</span>;
                                    ReactDOM.render(myElement, document.getElementById(`mutable_identityList` + index + `${index1}`));
                                });
                            }
                        })
                    })
                } else {
                    console.log("no identities found")
                }

            })
        }
        fetchToIdentities();
    }, []);

    const handleModalData = (formName, identityId, identity) => {
        setIdentity(identity);
        setIdentityId(identityId)
        setShowIdentity(true)
        setExternalComponent(formName)
    }
    return (
        <div className="container">
            <div className="accountInfo">
                <div className="row row-cols-1 row-cols-md-2 card-deck">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleModalData("Nub")}>Nub Txn</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleModalData("DefineIdentity")}>Define
                                Identity</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleModalData("IssueIdentity")}>Issue
                                Identity</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    {filteredIdentitiesList.map((identity, index) => {
                        let immutableProperties = "";
                        let mutableProperties = "";
                        let provisionedAddressList = "";
                        let unProvisionedAddressList = "";
                        const identityId = Helper.GetIdentityID(identity)
                        if (identity.value.immutables.value.properties.value.propertyList !== null) {
                            immutableProperties = Helper.ParseProperties(identity.value.immutables.value.properties.value.propertyList);
                        }
                        if (identity.value.mutables.value.properties.value.propertyList !== null) {
                            mutableProperties = Helper.ParseProperties(identity.value.mutables.value.properties.value.propertyList);
                        }
                        if (identity.value.provisionedAddressList !== null) {
                            provisionedAddressList = identity.value.provisionedAddressList;
                        }
                        if (identity.value.provisionedAddressList !== null) {
                            unProvisionedAddressList = identity.value.unprovisionedAddressList;
                        }
                        let immutableKeys = Object.keys(immutableProperties);
                        let mutableKeys = Object.keys(mutableProperties);
                        return (
                            <div className="col-md-6" key={index}>
                                <div className="card">
                                    <div>
                                        <Button variant="secondary"
                                                onClick={() => handleModalData("Provision", identityId)}>Provision</Button>
                                        <Button variant="secondary"
                                                onClick={() => handleModalData("UnProvision", identityId, identity)}>UnProvision</Button>
                                    </div>
                                    <a href="#">{identityId}</a>
                                    <p>Immutables</p>
                                    {immutableKeys !== null ?
                                        immutableKeys.map((keyName, index1) => {
                                            if (immutableProperties[keyName] !== "") {
                                                return (<a key={index + keyName}><b>{keyName} </b>: <span
                                                    id={`immutable_identityList` + index + `${index1}`}></span></a>)
                                            } else {
                                                return (
                                                    <a key={index + keyName}><b>{keyName} </b>: <span>{immutableProperties[keyName]}</span></a>)
                                            }
                                        })
                                        : ""
                                    }
                                    <p>Mutables</p>
                                    {mutableKeys !== null ?
                                        mutableKeys.map((keyName, index1) => {
                                            if (mutableProperties[keyName] !== "") {
                                                return (<a key={index + keyName}><b>{keyName} </b>: <span
                                                    id={`mutable_identityList` + index + `${index1}`}></span></a>)
                                            } else {
                                                return (
                                                    <a key={index + keyName}><b>{keyName} </b>: <span>{mutableProperties[keyName]}</span></a>)
                                            }
                                        })
                                        : ""
                                    }
                                    <h5>provisionedAddressList</h5>
                                    {provisionedAddressList !== null ?
                                        provisionedAddressList.map((provisionedAddress, addressKey) => {
                                            return (<p key={addressKey}>{provisionedAddress}</p>)
                                        })
                                        : ""
                                    }
                                    <h5>UnProvisionedAddressList</h5>
                                    {unProvisionedAddressList !== null ?
                                        unProvisionedAddressList.map((unprovisionedAddress, unprovisionedAddressKey) => {
                                            return (<p key={unprovisionedAddressKey}>{unprovisionedAddress}</p>)
                                        })
                                        : ""
                                    }
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <Modal
                show={showIdentity}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                {externalComponent === 'Nub' ?
                    <Nub/> :
                    null
                }
                {externalComponent === 'DefineIdentity' ?
                    <Define ActionName={identitiesDefine} FormName={'Define Identity'}/> :
                    null
                }
                {externalComponent === 'IssueIdentity' ?
                    <IssueIdentity/> :
                    null
                }

                {externalComponent === 'Provision' ?
                    <Provision identityId={identityId}/> :
                    null
                }
                {externalComponent === 'UnProvision' ?
                    <UnProvision identityId={identityId} identityIdList={identity}/> :
                    null
                }
            </Modal>
        </div>
    );
}
export default Identities