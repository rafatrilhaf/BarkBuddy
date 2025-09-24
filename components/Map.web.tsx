import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

type Props = React.ComponentProps<"div"> & { height?: number | string };

export default function MapWeb({ height = 320, style, ...rest }: Props) {
  const { t } = useLanguage();
  
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
        {t('components.mapWeb.nativeMapUnavailable')}
      </span>
    </div>
  );
}

export const Marker = () => null;
export const PROVIDER_GOOGLE = "web";
