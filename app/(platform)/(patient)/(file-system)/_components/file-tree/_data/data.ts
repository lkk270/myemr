import { SiHtml5, SiJavascript, SiCss3, SiMarkdown } from "react-icons/si";
import { FaNpm } from "react-icons/fa";

export const data = [
  {
    id: "1",
    name: "public",
    path: "/",
    namePath: "/public",
    children: [
      {
        id: "c1-1",
        name: "index.docx",
        isFile: true,
        parentId: "1",
        path: "/1/",
        namePath: "/public/index.docx",
      },
    ],
  },
  {
    id: "2",
    name: "src",
    path: "/",
    namePath: "/src",
    children: [
      {
        id: "c2-1",
        name: "App.csv",
        isFile: true,
        parentId: "2",
        path: "/2/",
        namePath: "/src/App.csv",
      },
      {
        id: "c2-2",
        name: "index.png",
        isFile: true,
        parentId: "2",
        path: "/2/",
        namePath: "/src/index.png",
      },
      {
        id: "c2-3",
        parentId: "2",
        name: "styles.jpg",
        isFile: true,
        path: "/2/",
        namePath: "/src/styles.jpg",
      },
    ],
  },
  {
    id: "3",
    name: "components",
    path: "/",
    namePath: "/components",
    children: [
      {
        id: "c3-1",
        name: "modal.mp4",
        isFile: true,
        parentId: "3",
        path: "/3/",
        namePath: "/components/modal.mp4",
      },
      {
        id: "4",
        name: "navbar",
        path: "/3/",
        parentId: "3",
        namePath: "/components/navbar",
        children: [
          {
            id: "c4-1",
            name: "home.mp3",
            isFile: true,
            parentId: "4",
            path: "/3/4/",
            namePath: "/components/navbar/home.mp3",
          },
        ],
      },
      {
        id: "4-1",
        name: "footer",
        path: "/3/",
        parentId: "3",
        namePath: "/components/footer",
        children: [
          {
            id: "c4-1-1",
            name: "bottom.txt",
            isFile: true,
            parentId: "4-1",
            path: "/3/4-1/",
            namePath: "/components/footer/bottom.txt",
          },
          {
            id: "4-1-2",
            name: "middle",
            path: "/3/4-1/",
            parentId: "4-1",
            namePath: "/components/footer/middle",
            children: [
              {
                id: "c4-1-1-12",
                name: "mid-bottom.pdf",
                isFile: true,
                parentId: "4-1-2",
                path: "/3/4-1/4-1-2/",
                namePath: "/components/footer/middle/mid-bottom.pdf",
              },
              {
                id: "c4-1-1-13",
                name: "top-bottom.mov",
                isFile: true,
                parentId: "4-1-2",
                path: "/3/4-1/4-1-2/",
                namePath: "/components/footer/middle/top-bottom.mov",
              },
              {
                id: "c4-1-1-14000",
                name: "topdsfasdfnsjdfnjskdnfkjsdf-bkl.tsx",
                isFile: true,
                parentId: "4-1-2",
                path: "/3/4-1/4-1-2/",
                namePath: "/components/footer/middle/topdsfasdfnsjdfnjskdnfkjsdf-bkl.tsxf",
              },

              {
                id: "c4-1-1-166",
                name: "topdsfasdfnsjdfnalpgheajskdnfkjsdf-bkl.tsx",
                isFile: true,
                parentId: "4-1-2",
                path: "/3/4-1/4-1-2/",
                namePath: "/components/footer/middle/topdsfasdfnsjdfnalpgheajskdnfkjsdf-bkl.tsxf",
              },
            ],
          },
        ],
      },
    ],
  },
];
