export class AssetLoader {
  async preloadImages(urls: string[]) {
    if (typeof window === "undefined") return;

    await Promise.all(
      urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const image = new Image();

            const finish = async () => {
              try {
                if ("decode" in image) {
                  await image.decode();
                }
              } catch {
                // Decoding can reject for already-loaded SVGs or browser-specific cases.
              } finally {
                resolve();
              }
            };

            image.onload = () => void finish();
            image.onerror = () => resolve();
            image.src = url;

            if (image.complete) {
              void finish();
            }
          }),
      ),
    );
  }
}
