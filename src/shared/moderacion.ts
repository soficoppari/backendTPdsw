/**
 * Módulo de moderación de contenido.
 * Filtra palabras ofensivas, insultos, lenguaje racista y obscenidades en español.
 */

// Lista de términos prohibidos (insultos, obscenidades, racismo y lenguaje ofensivo en español)
const PALABRAS_PROHIBIDAS: string[] = [
    // Insultos directos y groserías comunes
    'pelotudo', 'pelotuda', 'boludo', 'boluda', 'boludez', 'gilardo', 'gila',
    'forro', 'forra', 'cagón', 'cagona', 'cagon', 'cagona',
    'idiota', 'imbécil', 'imbecil', 'estúpido', 'estupido', 'estúpida', 'estupida',
    'tarado', 'tarada', 'retrasado', 'retrasada', 'mogólico', 'mogolico', 'mogólica', 'mogolica',
    'inútil', 'inutíl', 'inutil',
    'hdp', 'hhdp',

    // Términos sexuales ofensivos
    'puto', 'puta', 'putear', 'puteada', 'prostituta',
    'concha', 'conchuda', 'conchetumadre', 'ctm',
    'pija', 'pijudo', 'pijotero',
    'chota', 'chotear',
    'culo', 'culero',
    'mierda', 'mierdoso', 'mierdosa',
    'coger', 'cogido', 'cogida',
    'porno', 'pornográfico', 'pornografico',
    'sexo explícito',

    // Insultos hacia la madre / familia
    'tumare', 'tupadre', 'tumamare', 'remil',
    'hijo de puta', 'hijodeputa', 'hdeputa',
    'madre que lo parió', 'la puta madre', 'laputa',
    'tu vieja', 'tu viejo',

    // Términos racistas y discriminatorios
    'negro de mierda', 'villero', 'villera', 'negro cabeza',
    'sudaca', 'sudakas',
    'bolita', 'bolitas',
    'paragua', 'paraguas',   // uso peyorativo
    'cabecita negra',
    'grasa', 'grasiento', 'grasa de',
    'judío de mierda',
    'maricón', 'maricon', 'marica',
    'puto de mierda',
    'travelo', 'trola',
    'trava',                  // uso despectivo
    'mongólico', 'mongolico',
    'ñoqui',                  // uso despectivo laboral/étnico
    'chino de mierda', 'chino mugriento',
    'turco de mierda',

    // Amenazas y violencia verbal
    'te mato', 'te voy a matar', 'te cago a palos',
    'te rompo la cabeza', 'te reviento',
    'ojalá te mueras', 'ojalá te mueras', 'te deseo lo peor',

    // Términos adicionales de uso ofensivo frecuente
    'basura', // sólo si aparece como insulto, puede colisionar con contexto; se valida con regex por contexto
    'verga', 'vergón',
    'carajo', 'carajos',
    'maldito', 'maldita',
    'desgraciado', 'desgraciada',
    'animal', // como insulto (ej: "sos un animal")
    'bestia',  // como insulto
    'garca', 'garcon',
    'ortiva', 'ortiba',
];

/**
 * Normaliza un texto para comparación:
 * - pasa a minúsculas
 * - reemplaza caracteres especiales/acentos por su equivalente ASCII
 * - elimina caracteres separadores entre letras (e.g. "m.i.e.r.d.a")
 */
function normalizarTexto(texto: string): string {
    return texto
        .toLowerCase()
        .normalize('NFD')                         // descompone caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '')          // elimina diacríticos (tildes, etc.)
        .replace(/[.\-_*|\\\/]/g, '')             // elimina separadores comunes usados para evadir el filtro
        .replace(/0/g, 'o')                       // 0 → o (e.g. "p0rno")
        .replace(/1/g, 'i')                       // 1 → i (e.g. "st1pido")
        .replace(/3/g, 'e')                       // 3 → e (e.g. "p3lo")
        .replace(/4/g, 'a')                       // 4 → a
        .replace(/5/g, 's')                       // 5 → s
        .replace(/\s+/g, ' ')                     // normaliza espacios múltiples
        .trim();
}

/**
 * Verifica si un texto contiene alguna palabra o frase prohibida.
 * @returns string | null — La palabra encontrada, o null si el texto es limpio.
 */
export function detectarContenidoOfensivo(texto: string): string | null {
    if (!texto || texto.trim() === '') return null;

    const textNorm = normalizarTexto(texto);

    for (const termino of PALABRAS_PROHIBIDAS) {
        const terminoNorm = normalizarTexto(termino);

        // Busca el término como palabra completa o frase completa (con límites de palabra cuando es una sola palabra)
        const esFrase = terminoNorm.includes(' ');

        if (esFrase) {
            // Para frases, buscamos la subcadena exacta dentro del texto normalizado
            if (textNorm.includes(terminoNorm)) {
                return termino;
            }
        } else {
            // Para palabras simples, usamos límite de palabra para evitar falsos positivos
            // (e.g. "boluda" no debería coincidir con "aboluda" si existiese)
            const regex = new RegExp(`(^|\\s|[^a-z])${terminoNorm}(\\s|[^a-z]|$)`);
            if (regex.test(textNorm)) {
                return termino;
            }
        }
    }

    return null;
}
