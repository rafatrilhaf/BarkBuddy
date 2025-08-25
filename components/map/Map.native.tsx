import React from "react";
import MapView, { MapViewProps } from "react-native-maps";

export default function Map(props: MapViewProps) {
  return <MapView style={{ flex: 1 }} {...props} />;
}
