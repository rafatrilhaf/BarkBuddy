import React from "react";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type MapViewProps,
} from "react-native-maps";

export { Marker, PROVIDER_GOOGLE };

export default function Map(props: MapViewProps) {
  return <MapView {...props} />;
}
