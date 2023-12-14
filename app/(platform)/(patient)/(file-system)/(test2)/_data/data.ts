import { SiHtml5, SiJavascript, SiCss3, SiMarkdown } from "react-icons/si";
import { FaNpm } from "react-icons/fa";

export const data = [
  {
    id: "1",
    name: "public",
    children: [
      {
        id: "c1-1",
        name: "index.html",
        icon: SiHtml5,
        iconColor: "#dc4a25",
      },
    ],
  },
  {
    id: "2",
    name: "src",
    children: [
      {
        id: "c2-1",
        name: "App.docx",
        icon: SiJavascript,
        iconColor: "#efd81e",
      },
      {
        id: "c2-2",
        name: "index.pdf",
        icon: SiJavascript,
        iconColor: "#efd81e",
      },
      { id: "c2-3", name: "styles.css", icon: SiCss3, iconColor: "#42a5f5" },
    ],
  },
  { id: "3", name: "package.json", icon: FaNpm, iconColor: "#c43636" },
  { id: "4", name: "README.md", icon: SiMarkdown, iconColor: "#715537" },
];
