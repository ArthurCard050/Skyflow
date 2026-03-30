import { Post, MediaFormat } from '../types';
import * as XLSX from 'xlsx';

export async function parseCalendarToPosts(
  input: string,
  clientId: string,
  currentUser: string
): Promise<Post[]> {
  // If the input doesn't have tabs or commas, it's likely just garbage text.
  if (!input.includes('\t') && !input.includes(',') && !input.includes(';')) {
    throw new Error('O texto não parece estruturado. Copie e cole colunas do Excel ou envie um arquivo .xlsx.');
  }

  // Use a local parser instead of AI.
  // Parse the TSV or CSV using XLSX to get raw rows
  const workbook = XLSX.read(input, { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

  // Find header row loosely matching Data, Formato, Pilar etc.
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const rowStr = (rows[i] || []).join(' ').toLowerCase();
    if (rowStr.includes('formato') || rowStr.includes('pilar') || rowStr.includes('data')) {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx === -1) {
    throw new Error("Não foi possível identificar o cabeçalho. Certifique-se de que a planilha possui colunas como 'Data', 'Formato' e 'Copy' ou 'Roteiro'.");
  }

  const headers = rows[headerRowIdx].map(h => String(h || '').toLowerCase().trim());
  const dateIdx = headers.findIndex(h => h.includes('data') || h.includes('dia'));
  const formatIdx = headers.findIndex(h => h.includes('formato'));
  const pilarIdx = headers.findIndex(h => h.includes('pilar'));
  const ideaIdx = headers.findIndex(h => h.includes('ideia') || h.includes('arte') || h.includes('visual'));
  const copyIdx = headers.findIndex(h => h.includes('copy') || h.includes('roteiro') || h.includes('legenda') || h.includes('draft'));
  const ctaIdx = headers.findIndex(h => h.includes('cta') || h.includes('call to action'));

  const posts: Post[] = [];

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue; // Skip empty rows

    const rawDate = dateIdx >= 0 ? String(row[dateIdx] || '') : '';
    const rawFormat = formatIdx >= 0 ? String(row[formatIdx] || '').toLowerCase() : '';
    const pilar = pilarIdx >= 0 ? String(row[pilarIdx] || '') : '';
    const idea = ideaIdx >= 0 ? String(row[ideaIdx] || '') : '';
    const copy = copyIdx >= 0 ? String(row[copyIdx] || '') : '';
    const cta = ctaIdx >= 0 ? String(row[ctaIdx] || '') : '';

    if (!rawDate && !rawFormat && !copy) continue;

    // Local Date extraction (e.g. "01/04 - Terça-feira" -> 01 of April of current year)
    let dateObj = new Date();
    const dateMatch = rawDate.match(/(\d{1,2})\/(\d{1,2})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1; // 0-indexed
      dateObj = new Date(dateObj.getFullYear(), month, day);
    } else {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        dateObj = parsedDate;
      }
    }

    // Format estimation
    let mappedFormat: MediaFormat = 'square';
    if (rawFormat.includes('story') || rawFormat.includes('reels') || rawFormat.includes('shorts') || rawFormat.includes('tiktok')) {
      mappedFormat = 'story';
    } else if (rawFormat.includes('carrossel') || rawFormat.includes('estático') || rawFormat.includes('feed')) {
      mappedFormat = 'portrait';
    }

    const title = pilar ? pilar.substring(0, 50) : 'Post Importado';

    posts.push({
      id: Math.random().toString(36).substr(2, 9),
      clientId,
      platform: 'Instagram', 
      date: dateObj.toISOString().split('T')[0],
      caption: copy || 'Legenda pendente (verifique o Briefing Criativo).',
      title: title,
      contentPillar: pilar,
      visualDirection: idea,
      videoScript: copy,
      cta: cta,
      media: [],
      status: 'copy_production',
      format: mappedFormat,
      version: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUser,
      history: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'created',
          user: currentUser,
          timestamp: new Date().toISOString(),
          details: 'Post importado via leitura de planilha'
        }
      ]
    });
  }

  if (posts.length === 0) {
    throw new Error('Nenhum post foi extraído. Verifique se existem linhas de conteúdo válidas abaixo do cabeçalho.');
  }

  return posts;
}
