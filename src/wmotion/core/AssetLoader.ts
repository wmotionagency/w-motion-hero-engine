export class AssetLoader {
  async preloadImages(urls: string[]) {
    if (typeof window === "undefined") return;

    await Promise.all(
      urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = url;
          }),
      ),
    );
  }
}
