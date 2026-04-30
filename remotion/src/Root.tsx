import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={510} // 17s @ 30fps
    fps={30}
    width={1080}
    height={1920}
  />
);
