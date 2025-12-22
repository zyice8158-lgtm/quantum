import localforage from "localforage";
import { GET } from "./http";

export const getStyleList = async (params = {}) => {
  return {
    success: true,
    data: [
      {
        styleId: 43,
        styleName: "Default",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/r9tS7R3U202409040920537518347.jpg",
        isDefault: true,
      },
      {
        styleId: 44,
        styleName: "PPT illustrate",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/ivRkjoGA202409040920365789804.png",
      },
      {
        styleId: 45,
        styleName: "Human Realistic photo",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/YOerBTdB202409040920184853884.png",
      },
      {
        styleId: 46,
        styleName: "Ink style",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/Eqck1Rcp202409040920017997825.png",
      },
      {
        styleId: 47,
        styleName: "Pixel-art",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/xb1TRymE202409040919459517946.jpg",
      },
      {
        styleId: 48,
        styleName: "Sketch design drawings",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/sHaWn3Ph202409040919284311902.png",
      },
      {
        styleId: 49,
        styleName: "Mecha style",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/RQnwpJuK202409040919137404742.jpg",
      },
      {
        styleId: 50,
        styleName: "Cyber style",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/6M9uvjxh202409040918573874945.jpg",
      },
      {
        styleId: 51,
        styleName: "Anime style",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/BLh4m9tw202409040918345976869.png",
      },
      {
        styleId: 52,
        styleName: "Sci-fi style",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/JkWpLOyF202409040918021638518.png",
      },
      {
        styleId: 53,
        styleName: "Stick figures",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/Y2-RcTG9202409040917293875663.png",
      },
      {
        styleId: 54,
        styleName: "Hand Draw",
        iconUrl:
          "https://as3t.service.lenovo.com/aipc/cms/aiDesc/E4W78GHl202409040915590046198.png",
      },
    ],
  };
  const domain = await localforage.getItem("DOMAIN");
  const voucher = await localforage.getItem("VOUCHER");

  return await GET(`${domain}/quantumapi/enduser/image/style/listAll`, voucher, params);
};
