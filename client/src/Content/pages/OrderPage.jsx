"use client"
import React, { useEffect } from "react";
import HeroSection from "../Components/HeroSection";
import { useDispatch, useSelector } from "react-redux";
import { getCheckout } from "../Redux/ActionCreartors/CheckoutActionCreators";
import Order from "../Components/Order";


export default function OrderPage() {
  const CheckoutStateData = useSelector(
    (state) => state.CheckoutStateData || []
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCheckout());
  }, [dispatch]);

  const physicalOrders = CheckoutStateData.filter(
    (order) =>
      Array.isArray(order?.books) &&          // ← lowercase
      order.books.every((item) => item.format !== "Ebook")
  );

  return (
    <>
      <HeroSection title="Orders" />
      <Order title="Orders" data={physicalOrders} />
    </>
  );
}