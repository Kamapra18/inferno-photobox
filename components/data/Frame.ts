// data/frames.ts

export interface FramePosition {
  top: string;
  left: string;
  width: string;
  height: string;
  rotate: string;
}

export interface Frame {
  id: number;
  name: string;
  category: string;
  src: string;
  maxPhotos: number;

  positions: FramePosition[];
}

export const FRAMES: Frame[] = [
  {
    id: 1,
    name: "Classic Noir",
    category: "Photostrip",
    src: "/frame/frame5.png",
    maxPhotos: 4,
    positions: [
      {
        top: "390px",
        left: "160px",
        width: "354px",
        height: "472px",
        rotate: "-0.5deg",
      },
      {
        top: "390px",
        left: "685px",
        width: "354px",
        height: "472px",
        rotate: "0.8deg",
      },
      {
        top: "970px",
        left: "160px",
        width: "354px",
        height: "472px",
        rotate: "-1.5deg",
      },
      {
        top: "970px",
        left: "685x",
        width: "354px",
        height: "472px",
        rotate: "-1.5deg",
      },
    ],
  },
  // {
  //   id: 2,
  //   name: "Vintage Rose",
  //   category: "Vertical",
  //   src: "/frame/frame2.png",
  //   maxPhotos: 3,
  //   positions: [
  //     {
  //       top: "68px",
  //       left: "78px",
  //       width: "132px",
  //       height: "178px",
  //       rotate: "-0.5deg",
  //     },
  //     {
  //       top: "215px",
  //       left: "142px",
  //       width: "132px",
  //       height: "178px",
  //       rotate: "0.8deg",
  //     },
  //     {
  //       top: "395px",
  //       left: "88px",
  //       width: "132px",
  //       height: "178px",
  //       rotate: "-1.5deg",
  //     },
  //   ],
  // },
  {
    id: 3,
    name: "Eternal Gold",
    category: "4R",
    src: "/frame/frame4.png",
    maxPhotos: 6,
    positions: [
      /* Row 1 */
      {
        top: "300px",
        left: "100px",
        width: "450px",
        height: "450px",
        rotate: "0deg",
      },
      {
        top: "300px",
        left: "630px",
        width: "450px",
        height: "450px",
        rotate: "0deg",
      },

      /* Row 2 */
      {
        top: "800px",
        left: "100px",
        width: "450px",
        height: "450px",
        rotate: "0deg",
      },
      {
        top: "800px",

        left: "630px",
        width: "450px",
        height: "450px",
        rotate: "0deg",
      },

      /* Row 3 */
      {
        top: "1250px",
        left: "100px",
        width: "450px",
        height: "450px",
        rotate: "0deg",
      },
      {
        top: "1250px",

        left: "630px",
        width: "450px",
        height: "450px",
        rotate: "0deg",
      },
    ],
  },

  // {
  //   id: 4,
  //   name: "Cinema Story",
  //   category: "Story",
  //   src: "/frame/frame2.png",
  //   maxPhotos: 4,

  //   positions: [
  //     {
  //       top: "68px",
  //       left: "78px",
  //       width: "132px",
  //       height: "178px",
  //       rotate: "-0.5deg",
  //     },
  //     {
  //       top: "215px",
  //       left: "142px",
  //       width: "132px",
  //       height: "178px",
  //       rotate: "0.8deg",
  //     },
  //     {
  //       top: "395px",
  //       left: "88px",
  //       width: "132px",
  //       height: "178px",
  //       rotate: "-1.5deg",
  //     },
  //   ],
  // },
];
