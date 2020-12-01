import React, {useState, useEffect} from "react";
import ordersQueryJS from "persistencejs/transaction/orders/query";
import Helpers from "../../utilities/Helper";
import {Modal, Button, Dropdown} from "react-bootstrap";
import metasQueryJS from "persistencejs/transaction/meta/query";
import identitiesQueryJS from "persistencejs/transaction/identity/query";
import {Define} from "../forms";
import {CancelOrder} from "../forms/orders";
import ordersDefineJS from "persistencejs/transaction/orders/define";
import {useTranslation} from "react-i18next";

const ordersDefine = new ordersDefineJS(process.env.REACT_APP_ASSET_MANTLE_API)
const metasQuery = new metasQueryJS(process.env.REACT_APP_ASSET_MANTLE_API)
const identitiesQuery = new identitiesQueryJS(process.env.REACT_APP_ASSET_MANTLE_API)
const ordersQuery = new ordersQueryJS(process.env.REACT_APP_ASSET_MANTLE_API)


const Orders = () => {
    const Helper = new Helpers();
    const {t} = useTranslation();
    const [orderList, setOrderList] = useState([]);
    const userAddress = localStorage.getItem('address');
    const [showOrder, setShowOrder] = useState(false);
    const [externalComponent, setExternalComponent] = useState("");
    const [order, setOrder] = useState([]);
    const handleClose = () => {
        setShowOrder(false);
    };

    useEffect(() => {
        const fetchOrder = () => {
            const identities = identitiesQuery.queryIdentityWithID("all")
            identities.then(function (item) {
                const data = JSON.parse(item);
                const dataList = data.result.value.identities.value.list;
                if (dataList) {
                    const filterIdentities = Helper.FilterIdentitiesByProvisionedAddress(dataList, userAddress)
                    const ordersData = ordersQuery.queryOrderWithID("all")
                    ordersData.then(function (item) {
                        const ordersData = JSON.parse(item);
                        const ordersDataList = ordersData.result.value.orders.value.list;
                        if (ordersDataList) {
                            const filterOrdersByIdentities = Helper.FilterOrdersByIdentity(filterIdentities, ordersDataList)
                            setOrderList(filterOrdersByIdentities);
                            filterOrdersByIdentities.map((order, index) => {
                                let immutableProperties = "";
                                let mutableProperties = "";
                                if (order.value.immutables.value.properties.value.propertyList !== null) {
                                    immutableProperties = Helper.ParseProperties(order.value.immutables.value.properties.value.propertyList)
                                }
                                if (order.value.mutables.value.properties.value.propertyList !== null) {
                                    mutableProperties = Helper.ParseProperties(order.value.mutables.value.properties.value.propertyList)
                                }
                                let immutableKeys = Object.keys(immutableProperties);
                                let mutableKeys = Object.keys(mutableProperties);
                                Helper.AssignMetaValue(immutableKeys, immutableProperties, metasQuery, 'immutable_order', index);
                                Helper.AssignMetaValue(mutableKeys, mutableProperties, metasQuery, 'mutable_order', index);
                            })
                        } else {
                            console.log("no orders found")
                        }
                    })
                }
            })
        }
        fetchOrder();
    }, []);

    const handleModalData = (formName, order) => {
        console.log("1")
        setOrder(order);
        setShowOrder(true)
        setExternalComponent(formName)
    }

    return (
        <div className="container">
            <div className="accountInfo">
                <div className="row row-cols-1 row-cols-md-2 card-deck ">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            {t("ACTIONS")}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item
                                onClick={() => handleModalData("DefineOrder")}>{t("DEFINE_ORDER")}</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    {orderList.map((order, index) => {
                        let immutableProperties = "";
                        let mutableProperties = "";
                        if (order.value.immutables.value.properties.value.propertyList !== null) {
                            immutableProperties = Helper.ParseProperties(order.value.immutables.value.properties.value.propertyList)
                        }
                        if (order.value.mutables.value.properties.value.propertyList !== null) {
                            mutableProperties = Helper.ParseProperties(order.value.mutables.value.properties.value.propertyList)
                        }

                        let immutableKeys = Object.keys(immutableProperties);
                        let mutableKeys = Object.keys(mutableProperties);
                        return (<div className="col-md-6" key={index}>
                                <div className="card">
                                    <div>
                                        <Button variant="secondary"
                                                onClick={() => handleModalData("CancelOrder", order)}>Cancel</Button>
                                    </div>
                                    <a href="#">{Helper.GetOrderID(order)}</a>
                                    <p>{t("IMMUTABLES")}</p>
                                    {
                                        immutableKeys.map((keyName, index1) => {
                                            if (immutableProperties[keyName] !== "") {
                                                return (<a key={index + keyName}><b>{keyName} </b>: <span
                                                    id={`immutable_order` + index + `${index1}`}></span></a>)
                                            } else {
                                                return (
                                                    <a key={index + keyName}><b>{keyName} </b>: <span>{immutableProperties[keyName]}</span></a>)
                                            }
                                        })
                                    }

                                    <p>{t("MUTABLES")}</p>

                                    {
                                        mutableKeys.map((keyName, index1) => {
                                            if (mutableProperties[keyName] !== "") {
                                                return (<a key={index + keyName}><b>{keyName} </b>: <span
                                                    id={`mutable_order` + index + `${index1}`}></span></a>)
                                            } else {
                                                return (
                                                    <a key={index + keyName}><b>{keyName} </b>: <span>{mutableProperties[keyName]}</span></a>)
                                            }
                                        })
                                    }
                                </div>
                            </div>
                        )

                    })}
                </div>
            </div>
            <Modal
                show={showOrder}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                {externalComponent === 'DefineOrder' ?
                    <Define ActionName={ordersDefine} FormName={'Define Order'}/> :
                    null
                }

                {externalComponent === 'CancelOrder' ?
                    <CancelOrder order={order}/> :
                    null
                }
            </Modal>
        </div>
    );
};

export default Orders;
