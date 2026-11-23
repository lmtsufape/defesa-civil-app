import { useIonToast, useIonLoading } from '@ionic/react';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface PrintOptions {
  fileName: string;
  containerSelector: string;
}

/**
 * Converte uma URL de imagem remota em data:URL base64.
 * Retorna null silenciosamente em caso de falha.
 */
const urlParaBase64 = async (src: string): Promise<string | null> => {
  try {
    const response = await fetch(src, {
      mode: 'cors',
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('[usePdfExport] Falha ao converter imagem para base64:', src, e);
    return null;
  }
};

/**
 * Aguarda uma imagem carregar (ou falhar) no DOM.
 */
const aguardarImagem = (img: HTMLImageElement): Promise<void> =>
  new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) {
      resolve();
      return;
    }
    img.onload = () => resolve();
    img.onerror = () => resolve(); // resolve mesmo em erro para não travar o PDF
  });

/**
 * Hook para gerenciar a exportação de documentos para PDF.
 * Suporta download direto no navegador e integração com sistema de arquivos/compartilhamento no mobile (Capacitor).
 */
export const usePdfExport = () => {
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();

  const exportToPdf = async ({ fileName, containerSelector }: PrintOptions) => {
    const element = document.querySelector(containerSelector) as HTMLElement;

    if (!element) {
      presentToast({
        message: 'Erro: Conteúdo não encontrado.',
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
      return;
    }

    await presentLoading({
      message: 'Gerando PDF...',
      spinner: 'crescent',
    });

    let tempContainer: HTMLDivElement | null = null;

    try {
      // 1. Cria container temporário fora da tela
      tempContainer = document.createElement('div');
      tempContainer.className = 'pdf-export-temp-container force-desktop-layout';

      Object.assign(tempContainer.style, {
        position: 'fixed',
        left: '-10000px',
        top: '0',
        width: '210mm',
        background: '#ffffff',
        zIndex: '-9999',
      });

      const clone = element.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        display: 'block',
        visibility: 'visible',
        width: '210mm',
        background: '#ffffff',
      });

      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // 2. Converte TODAS as imagens remotas para base64 ANTES de capturar o canvas.
      //    Isso garante que o html2canvas nunca precisará fazer requisições externas.
      const images = Array.from(clone.querySelectorAll('img')) as HTMLImageElement[];

      await Promise.all(
        images.map(async (img) => {
          const src = img.src;
          if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;

          const base64 = await urlParaBase64(src);
          if (base64) {
            img.src = base64;
            await aguardarImagem(img);
          }

          // Garante visibilidade
          img.style.display = 'block';
          img.style.opacity = '1';
          img.style.visibility = 'visible';
          img.removeAttribute('crossorigin');
          img.removeAttribute('loading');
        })
      );

      // 3. Aguarda um tick extra para o layout estabilizar
      await new Promise((resolve) => setTimeout(resolve, 800));

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      });

      const pages = Array.from(clone.querySelectorAll('.pdf-page')) as HTMLElement[];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Garante visibilidade da página
        page.style.display = 'flex';
        page.style.visibility = 'visible';

        // Renderiza cada página individualmente.
        // NÃO usa onclone — as imagens já estão em base64 no DOM clonado.
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: false,      // desabilitado: todas imagens já são base64
          allowTaint: false,   // desabilitado: não há imagens externas
          logging: false,
          backgroundColor: '#ffffff',
          width: page.offsetWidth || 794,
          height: page.offsetHeight || 1123,
          windowWidth: 800,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'SLOW');
      }

      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        const pdfBase64 = pdf.output('datauristring');
        const base64Content = pdfBase64.split(',')[1];
        const fullFileName = `${fileName}.pdf`;

        const savedFile = await Filesystem.writeFile({
          path: fullFileName,
          data: base64Content,
          directory: Directory.Cache,
        });

        await Share.share({
          title: 'Vistoria Técnica',
          text: 'PDF da Vistoria Técnica',
          url: savedFile.uri,
          dialogTitle: 'Abrir ou Salvar PDF',
        });
      } else {
        pdf.save(`${fileName}.pdf`);
      }

      presentToast({
        message: isNative ? 'PDF pronto para salvar ou compartilhar!' : 'PDF baixado com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
    } catch (error) {
      console.error('[usePdfExport] Erro ao gerar PDF:', error);
      presentToast({
        message: 'Não foi possível gerar o PDF.',
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
    } finally {
      if (tempContainer?.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
      dismissLoading();
    }
  };

  return { exportToPdf };
};
