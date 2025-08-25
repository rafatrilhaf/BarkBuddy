import React from "react";

type Props = React.ComponentProps<"div"> & { height?: number | string };

export default function MapWeb({ height = 320, style, ...rest }: Props) {
  return (
    <div
      {...rest}
      style={{
        height,
        width: "100%",
        display: "grid",
        placeItems: "center",
        border: "1px dashed #bbb",
        borderRadius: 12,
        background: "#f7f7f7",
        ...style,
      }}
    >
      <span style={{ opacity: 0.7 }}>
        Mapa nativo indisponível no Web. Abra no Android/iOS.
      </span>
    </div>
  );
}
export const Marker = () => null;
export const PROVIDER_GOOGLE = "web";
