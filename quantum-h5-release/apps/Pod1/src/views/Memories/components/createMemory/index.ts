export interface ImgItem {
  url: string;
  showingUrl:string;
}

export interface MemoryItem {
  id: string;
  content: string;
  imgList: ImgItem[];
  contentUri?:string;
}