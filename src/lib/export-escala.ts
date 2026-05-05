import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportarEscala(
  el: HTMLElement,
  filename: string,
  formato: "pdf" | "png",
) {
  await document.fonts?.ready;
  await Promise.all(
    Array.from(el.querySelectorAll("img")).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }),
  );

  const { element, cleanup } = criarElementoSeguroParaExportar(el);
  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      ignoreElements: (node) => node.hasAttribute("data-html2canvas-ignore"),
    });
  } finally {
    cleanup();
  }

  if (formato === "png") {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Não foi possível gerar a imagem.");
    baixarArquivo(blob, `${filename}.png`);
    return;
  }

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.height > canvas.width ? "portrait" : "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  baixarArquivo(pdf.output("blob"), `${filename}.pdf`);
}

function baixarArquivo(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function criarElementoSeguroParaExportar(original: HTMLElement) {
  const htmlBg = document.documentElement.style.backgroundColor;
  const bodyBg = document.body.style.backgroundColor;
  document.documentElement.style.backgroundColor = "#ffffff";
  document.body.style.backgroundColor = "#ffffff";

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-100000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${original.offsetWidth}px`;
  wrapper.style.background = "#ffffff";
  wrapper.style.pointerEvents = "none";

  const clone = original.cloneNode(true) as HTMLElement;
  copiarEstilosSeguros(original, clone);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return {
    element: clone,
    cleanup: () => {
      wrapper.remove();
      document.documentElement.style.backgroundColor = htmlBg;
      document.body.style.backgroundColor = bodyBg;
    },
  };
}

function copiarEstilosSeguros(source: Element, target: Element) {
  const computed = getComputedStyle(source);
  const targetStyle = (target as HTMLElement | SVGElement).style;
  for (let i = 0; i < computed.length; i += 1) {
    const prop = computed.item(i);
    const value = valorCssSeguro(prop, computed.getPropertyValue(prop));
    if (value) targetStyle.setProperty(prop, value, computed.getPropertyPriority(prop));
  }
  target.removeAttribute("class");

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);
  sourceChildren.forEach((child, index) => {
    const clonedChild = targetChildren[index];
    if (clonedChild) copiarEstilosSeguros(child, clonedChild);
  });
}

function valorCssSeguro(prop: string, value: string) {
  if (!value.includes("oklch") && !value.includes("color-mix")) return value;
  if (prop.includes("shadow")) return "none";
  if (prop.includes("background")) return prop === "background-image" ? "none" : "transparent";
  if (prop.includes("border") || prop.includes("outline")) return "#366EB4";
  if (prop === "color" || prop.includes("text-decoration")) return "#000000";
  return "initial";
}