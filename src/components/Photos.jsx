import React from "react";

export const Photos = ({ image }) => {
  return (
    <div
      className="
      w-[100%]
      h-[100%]
      p-6
      overflow-hidden
      rounded-3xl
      bg-transparent
      shadow-lg
      hover:-translate-y-2
      transition-all
      duration-300
      "
    >
      <img
        src={image}
        alt="photo"
        className="
        w-full
        h-full
        object-cover
        hover:scale-110
        transition-transform
        duration-500
        "
      />
    </div>
  );
};