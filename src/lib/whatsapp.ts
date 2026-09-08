const GROUP_CODE="Gwg3PzkzxeW2DvsUIsVCaC";
export const WHATSAPP_GROUP_URL=`https://chat.whatsapp.com/${GROUP_CODE}`;
function getUA(){return typeof navigator!=="undefined"?navigator.userAgent:""}
function isIOS(ua:string){return /iPhone|iPad|iPod/i.test(ua)}
function isInAppBrowser(ua:string){if(/Android/i.test(ua)&&/;\s*wv\)/.test(ua))return true;if(isIOS(ua)&&!/Safari/i.test(ua))return true;return /Instagram|FBAN|FBAV|TikTok/i.test(ua)}
export function openWhatsAppGroup(onStuck:()=>void=()=>{}){const ua=getUA();if(!isInAppBrowser(ua)){window.open(WHATSAPP_GROUP_URL,"_blank","noopener,noreferrer");return}window.setTimeout(()=>{try{window.location.href=WHATSAPP_GROUP_URL}catch{onStuck()}},100);window.setTimeout(()=>{if(!document.hidden)onStuck()},2200)}
