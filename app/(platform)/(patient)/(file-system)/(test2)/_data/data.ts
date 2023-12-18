import { SiHtml5, SiJavascript, SiCss3, SiMarkdown } from "react-icons/si";
import { FaNpm } from "react-icons/fa";

export const data = [
  {
    id: "1",
    name: "public",
    parentId: "-1",
    children: [
      {
        id: "c1-1",
        name: "index.html",
        icon: SiHtml5,
        iconColor: "#dc4a25",
        isFile: true,
        parentId: "1",
      },
    ],
  },
  {
    id: "2",
    name: "src",
    parentId: "-1",
    children: [
      {
        id: "c2-1",
        name: "App.docx",
        icon: SiJavascript,
        iconColor: "#efd81e",
        isFile: true,
        parentId: "2",
      },
      {
        id: "c2-2",
        name: "index.pdf",
        icon: SiJavascript,
        iconColor: "#efd81e",
        isFile: true,
        parentId: "2",
      },
      { id: "c2-3", parentId: "2", name: "styles.css", icon: SiCss3, iconColor: "#42a5f5", isFile: true },
    ],
  },
  {
    id: "3",
    name: "components",
    parentId: null,
    children: [
      {
        id: "c3-1",
        name: "modal.tsx",
        icon: SiHtml5,
        iconColor: "#dc4a25",
        isFile: true,
        parentId: "3",
      },
      {
        id: "4",
        name: "navbar",
        parentId: "3",
        children: [
          {
            id: "c4-1",
            name: "home.tsx",
            icon: SiHtml5,
            iconColor: "#dc4a25",
            isFile: true,
            parentId: "4",
          },
        ],
      },
    ],
  },
];
