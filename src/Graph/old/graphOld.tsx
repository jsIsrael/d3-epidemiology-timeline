import * as React from "react";
import { runD3Stuff } from "./runD3Stuff";

export function Graph() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      runD3Stuff(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}
