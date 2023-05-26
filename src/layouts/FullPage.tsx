import { heights, widths } from "@/components/Mantine/sizing";
import { Box } from "@mantine/core";
import type { FC, ReactNode } from "react";

type FullPageLayoutProps = {
  children?: ReactNode;
};

const FullPageLayout: FC<FullPageLayoutProps> = (props) => {
  const { children } = props;
  return (
    <Box
      style={{
        display: "flex",
        width: widths.full,
        height: heights.screen,
      }}
    >
      <Box
        style={{
          flexGrow: 1,
          minWidth: 0,
          height: heights.full,
          display: "flex",
          alignItems: "stretch",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default FullPageLayout;
