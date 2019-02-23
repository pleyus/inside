/**
 * Provee propiedades de un boton para emular desde una vista HTML
 */
export class Button {
  /**
   * Prepara las propiedades de un objeto Boton que puede ser interpretado en una vista
   * @param Text Texto del boton (Utilice un texto corto)
   * @param Action Metodo a ejecutar al hacer clic en el boton
   * @param Class Clase CSS que se le asignará (default: empty)
   * @param Tooltip Descripción de la acción del boton
   */
  constructor(
    public Text: string,
    public Action: (e) => void,
    public Class: string = '',
    public Tooltip: string = '',
  ) {}
}
