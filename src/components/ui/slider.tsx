"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

function Slider({ className, ...props }: SliderPrimitive.Root.Props) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("w-full", className)}
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="flex w-full touch-none items-center py-2"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="bg-input relative h-1.5 w-full rounded-full"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className="bg-primary rounded-full"
          />
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            className="border-primary bg-background focus-visible:ring-ring/50 size-4 rounded-full border shadow-sm outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
