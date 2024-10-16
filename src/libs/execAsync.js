import { resolveDynamicString, resolveTemplate } from "./utils";
// Execute route loader and handle caching
export const execAsyncLoader = async (matchedRoute, fnArgs, cache) => {
  let cachedData = null;
  let cacheResult = false;
  // Caching logic
  if (matchedRoute.config?.loader_cache) {
    cachedData = cache.get(matchedRoute.path, "LOADER");

    if (!cachedData) cacheResult = true;
  }

  if (cachedData) {
    matchedRoute.data = cachedData;
    return;
  } else {
    if (typeof matchedRoute.loader === "function") {
      matchedRoute.data = await matchedRoute.loader(fnArgs);
      if (cacheResult) {
        cache.add(
          {
            path: matchedRoute.path,
            entry: matchedRoute.data,
          },
          "LOADER"
        );
      }
    }
  }
};

// Execute template loading and handle caching
export const execAsyncContent = async (matchedRoute, fnArgs, cache) => {
  let cachedContent = null; //Cache data
  let cacheResult = false; //Whether to cache new data or not
  // Caching logic
  if (matchedRoute.config?.content_cache) {
    cachedContent = cache.get(matchedRoute.path, "CONTENT");
    if (!cachedContent) cacheResult = true;
  }

  if (cachedContent) {
    console.log("cache hit");
    matchedRoute.content = cachedContent;
    return;
  } else {
    if (
      typeof matchedRoute.content == "string" &&
      !matchedRoute.config?.template
    ) {
      matchedRoute.content = resolveDynamicString(matchedRoute.content, fnArgs);
    } else if (typeof matchedRoute.content == "function") {
      matchedRoute.content = matchedRoute.content(fnArgs);
    } else if (matchedRoute.config?.template) {
      matchedRoute.content = await resolveTemplate(
        matchedRoute.content,
        fnArgs
      );
    }
    if (cacheResult) {
      cache.add(
        {
          path: matchedRoute.path,
          entry: matchedRoute.content,
        },
        "CONTENT"
      );
    }
  }
};