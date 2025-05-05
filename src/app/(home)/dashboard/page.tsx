/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef } from "react";
import { animate } from "animejs";

export const Demo1 = () => {
  return (
    <div className="flex items-center justify-center flex-wrap h-screen gap-2.5 p-5">
      <div className="relative">
        {/* Card Image Container */}
        <div className="w-[25rem] h-[25rem] rounded-[1.25rem] border-[0.5rem] border-[var(--border)] overflow-hidden relative">
          <img src="/dragon/chameleons.avif" alt="image" className="w-full h-full object-cover" />
        </div>

        {/* Title section - top left */}
        <div className=" w-[12.5rem] h-[3.75rem] flex justify-center items-center absolute top-0 left-0 bg-[var(--background)] border-b-[0.5rem] border-r-[0.5rem] border-[var(--border)] rounded-br-[1rem] p-[0.3rem]">
          <p className="bg-[var(--border)] text-white text-[0.875rem] py-[0.3rem] px-[0.625rem] w-[95%] flex justify-center items-center gap-[0.3125rem] rounded-[0.3125rem]">
            <span className="font-semibold text-[1.2rem]">Tesla Roadster</span>
          </p>
        </div>
        <div className="w-[1.25rem] h-[1.25rem] absolute top-[0%] left-[48%] rounded-tl-[0.8rem] shadow-[-0.375rem_-0.375rem_var(--background)] "></div>

        {/* Curved elements for title */}
        <div className="w-[1.25rem] h-[1.25rem] absolute top-[13%] left-0 rounded-tl-[0.8rem] shadow-[-0.375rem_-0.375rem_var(--background)]"></div>

        {/* Price tag - bottom right */}
        <div className="w-[12.5rem] h-[3.75rem] flex justify-center items-center absolute right-0 bottom-0 bg-[var(--background)] border-t-[0.5rem] border-l-[0.5rem] border-[var(--border)] rounded-tl-[1rem] p-[0.3rem]">
          <p className="bg-[var(--border)] text-white text-[0.875rem] py-[0.3rem] px-[0.625rem] w-[95%] flex justify-center items-center gap-[0.3125rem] rounded-[0.3125rem]">
            <span className="font-semibold text-[1.2rem]">$200,000</span>
          </p>
        </div>

        <div className="w-[1.25rem] h-[1.25rem] absolute bottom-[13%] right-[0%] rounded-br-[0.8rem] shadow-[0.375rem_0.375rem_var(--background)] "></div>
        {/* Curved elements for price tag */}
        <div className="w-[1.25rem] h-[1.25rem] absolute left-[47%] bottom-0 rounded-br-[0.8rem] shadow-[0.375rem_0.375rem_var(--background)]"></div>
      </div>
    </div>
  );
};

export const Demo2 = () => {
  return (
    <div>
      <div
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 50% 100%, 50% 75%, 0 75%)",
        }}
        className="w-64 h-48 bg-teal-400 p-3"
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </div>
      <div className="relative rounded-tr-lg">
        <div
          style={{
            clipPath: "polygon(0 0, 48% 0%, 48% 25%, 100% 25%, 100% 100%, 0 100% )",
            position: "absolute",
            top: "-40px",
          }}
          className="w-64 h-48 bg-amber-400 p-3 flex items-end justify-start"
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </div>
      </div>
    </div>
  );
};

export const Demo3 = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 w-full h-full gap-5">
      <div className="flex flex-col items-center gap-3 w-full h-fit">
        <div
          className={`
            image bg-[url(/dragon/chameleons.avif)] bg-origin bg-center bg-cover bg-no-repeat 
            relative h-52 w-full rounded-lg 
            before:content-[''] before:absolute before:w-5 before:h-5
            before:bottom-[68px] before:right-0 before:rounded-full
            before:shadow-[10px_10px_0px_var(--background)]
            after:content-[''] after:absolute after:w-5 after:h-5
            after:bottom-0 after:left-[45%] after:rounded-full
            after:shadow-[10px_10px_0px_var(--background)]
            `}
        ></div>
        <div
          className={`
            content w-full bg-violet-500 relative rounded-tl-lg rounded-b-lg
            before:content-[''] before:absolute before:-top-5 before:left-[48%]
            before:w-5 before:h-5 before:rounded-full before:z-10
            before:shadow-[8px_8px_0px_var(--color-violet-500)]
          `}
        >
          <div
            className={`
              absolute -top-[calc(5rem-1px)] right-0 w-[50%] h-20 rounded-tl-xl 
              bg-violet-500 border-t-12 border-l-12 border-background
              after:content-[''] after:absolute after:top-0 after:right-0
              after:w-5 after:h-5 after:rounded-full after:z-10
              // after:shadow-[11px_-10px_0px_var(--background)]
            `}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="bg-background px-4 py-2 rounded">Pokemon</span>
            </div>
          </div>
          <div className="px-4 py-2 w-full">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus suscipit ea, porro tenetur reprehenderit
            facere est et magni numquam alias excepturi, cum molestiae iure quo soluta fuga, asperiores quis.
            Blanditiis!
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 w-full h-fit">
        <div
          className={`
            image bg-[url(/dragon/chameleons.avif)] bg-origin bg-center bg-cover bg-no-repeat 
            relative h-52 w-full rounded-lg 
            before:content-[''] before:absolute before:w-5 before:h-5
            before:bottom-[68px] before:right-0 before:rounded-full
            before:shadow-[10px_10px_0px_var(--background)]
            after:content-[''] after:absolute after:w-5 after:h-5
            after:bottom-0 after:left-[45%] after:rounded-full
            after:shadow-[10px_10px_0px_var(--background)]
            `}
        ></div>
        <div
          className={`
            content w-full bg-violet-500 relative rounded-tl-lg rounded-b-lg
            before:content-[''] before:absolute before:-top-5 before:left-[48%]
            before:w-5 before:h-5 before:rounded-full before:z-10
            before:shadow-[8px_8px_0px_var(--color-violet-500)]
          `}
        >
          <div
            className={`
              absolute -top-[calc(5rem-1px)] right-0 w-[50%] h-20 rounded-tl-xl 
              bg-violet-500 border-t-12 border-l-12 border-background
              after:content-[''] after:absolute after:top-0 after:right-0
              after:w-5 after:h-5 after:rounded-full after:z-10
              // after:shadow-[11px_-10px_0px_var(--background)]
            `}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="bg-background px-4 py-2 rounded">Pokemon</span>
            </div>
          </div>
          <div className="px-4 py-2 w-full">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus suscipit ea, porro tenetur reprehenderit
            facere est et magni numquam alias excepturi, cum molestiae iure quo soluta fuga, asperiores quis.
            Blanditiis!
          </div>
        </div>
      </div>
    </div>
  );
};

const AnimatedBoxes = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create boxes
    const container = containerRef.current;
    for (let i = 0; i < 100; i++) {
      const div = document.createElement("div");
      div.classList.add("box");
      container.appendChild(div);
    }

    // Animation function
    const animateBoxes = () => {
      animate(".box", {
        translateX: () => Math.random() * 1400 - 700,
        translateY: () => Math.random() * 1000 - 500,
        scale: () => Math.random() * 4.5 + 0.5,
        easing: "linear",
        duration: 3000,
        delay: (el, i) => i * 10, // Stagger delay using function
        complete: animateBoxes,
      });
    };

    // Start animation
    animateBoxes();

    // Cleanup function
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="container">
      <h1 className="relative z-10 text-4xl font-bold">Hello world!</h1>
      <style jsx>{`
        .container {
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
        }

        .box {
          position: absolute;
          height: 50px;
          width: 100px;
          background: #6969ff;
          box-shadow: 10px 10px 50px #7171df;
        }
      `}</style>
    </div>
  );
};
const FancyCard = () => {
  return (
    <div className="flex items-center justify-center flex-wrap h-screen gap-2.5 p-5">
      <AnimatedBoxes />
    </div>
  );
};

export default FancyCard;
