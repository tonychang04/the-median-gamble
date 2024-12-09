import { Devvit } from '@devvit/public-api';

export function LoadingState(): JSX.Element {
  return (
    <zstack width="100%" height="100%" alignment="center middle" backgroundColor="#1a1a1a">
      <image
        url="loading.gif"
        description="Loading ..."
        imageHeight={1080}
        imageWidth={1080}
      width="128px"
      height="128px"
      resizeMode="scale-down"
    />
  </zstack>
);
}