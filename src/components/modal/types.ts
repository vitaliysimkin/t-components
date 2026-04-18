export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number | string;
  height: number | string;
}

export type PositionPreset = 
  | "top-left" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-right" 
  | "center";

export type ModalPosition = Position | PositionPreset;
export interface ResizeOptions {
  enabled?: boolean;
  throttleTimeout?: number;
}


export interface ModalBoxConfig {
  id?: string;
  size?: Size;
  maxSize?: Size;
  minSize?: Size;
  position?: ModalPosition;
  draggable?: boolean;
  resizable?: boolean;
  closable?: boolean;
  minimizable?: boolean;
  blocking?: boolean;
  blockingDismissible?: boolean;
}


export interface ModalInputConfig {
  code: string;
  label: string; // #TODO or i18n localization string
  type: 'text' | 'number' | 'password' | 'email' | 'textarea' | 'swtich' | 'code';
  placeholder?: string; // #TODO or i18n localization string
  defaultValue?: string | number | boolean;
  attrs?: Record<string, unknown>;
}



export const DEFAULT_MODAL_BOX_CONFIG: ModalBoxConfig = {
  size: { width: 400, height: 'min-content' },
  minSize: { width: 200, height: 150 },
  maxSize: { width: "90vw", height: "90vh" },
  position: "center",
  draggable: true,
  resizable: true,
  closable: true,
  minimizable: true,
  blocking: false,
  blockingDismissible: true
};