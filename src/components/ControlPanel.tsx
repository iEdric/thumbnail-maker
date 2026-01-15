import React, { useState, memo } from 'react';
import { EditorState, Layer, TextLayer, ImageLayer, FontFamily, FileUploadEvent } from '../types';
import { Sliders, Layers, Wand2, Download, Image as ImageIcon, Trash2, Plus, GripVertical, type LucideIcon, Images, Maximize2, Minimize2 } from 'lucide-react';
import { FONT_FAMILIES, FONT_WEIGHTS, TEXT_COLOR_PRESETS, OVERLAY_COLOR_PRESETS, FILTER_RANGES, LAYER_RANGES } from '../constants';

interface ControlPanelProps {
  state: EditorState;
  onUpdateBackground: (updates: Partial<EditorState['background']>) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onAddLayer: (text?: string) => void;
  onAddImageLayer: (e: FileUploadEvent) => void;
  onDeleteLayer: (id: string) => void;
  onSelectLayer: (id: string) => void;
  onExport: () => void;
  onUploadImage: (e: FileUploadEvent) => void;
}

type TabType = 'layer' | 'backdrop';

const TabButton = ({ id, activeTab, setActiveTab, icon: Icon, label }: {
  id: TabType,
  activeTab: TabType,
  setActiveTab: (id: TabType) => void,
  icon: LucideIcon,
  label: string
}) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex-1 py-3 flex flex-col justify-center items-center gap-1 transition-colors border-b-2 ${
      activeTab === id
      ? 'border-neon-cyan text-neon-cyan bg-slate-800/50'
      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`}
  >
    <Icon size={18} />
    <span className="text-[10px] font-bold tracking-wider">{label}</span>
  </button>
);

const TypeIcon = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

export const ControlPanel = memo<ControlPanelProps>(({
  state,
  onUpdateBackground,
  onUpdateLayer,
  onAddLayer,
  onAddImageLayer,
  onDeleteLayer,
  onSelectLayer,
  onExport,
  onUploadImage,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('backdrop');

  const selectedLayer = state.layers.find(l => l.id === state.selectedLayerId);

  // Auto-switch to layer tab if a layer is selected
  React.useEffect(() => {
    if (selectedLayer) {
      setActiveTab('layer');
    }
  }, [selectedLayer?.id]);


  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-20 shadow-2xl shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 shrink-0">
        <TabButton id="backdrop" activeTab={activeTab} setActiveTab={setActiveTab} icon={ImageIcon} label="BACKDROP" />
        <TabButton id="layer" activeTab={activeTab} setActiveTab={setActiveTab} icon={Sliders} label="LAYER" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
        {/* BACKDROP TAB */}
        {activeTab === 'backdrop' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Main Background</h3>

                <label className="block w-full cursor-pointer group">
                   <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-neon-cyan transition-colors bg-slate-800/50">
                     <ImageIcon className="mx-auto mb-2 text-slate-400 group-hover:text-neon-cyan" />
                     <span className="text-sm text-slate-300">Upload Background</span>
                     <input type="file" className="hidden" accept="image/*" onChange={onUploadImage} />
                   </div>
                </label>

                {state.background.url && (
                  <div className="flex gap-2 p-1 bg-slate-800 rounded-lg border border-slate-700">
                    <button
                      onClick={() => onUpdateBackground({ size: 'cover' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all ${state.background.size === 'cover' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Maximize2 size={14} /> Fill
                    </button>
                    <button
                      onClick={() => onUpdateBackground({ size: 'contain' })}
                       className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all ${state.background.size === 'contain' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Minimize2 size={14} /> Fit
                    </button>
                  </div>
                )}

                {/* Filters */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Filters</h3>

                  {[
                    {
                      label: 'Brightness',
                      val: state.background.brightness,
                      key: 'brightness' as const,
                      max: FILTER_RANGES.brightness.max,
                      unit: '%'
                    },
                    {
                      label: 'Contrast',
                      val: state.background.contrast,
                      key: 'contrast' as const,
                      max: FILTER_RANGES.contrast.max,
                      unit: '%'
                    },
                    {
                      label: 'Saturation',
                      val: state.background.saturate,
                      key: 'saturate' as const,
                      max: FILTER_RANGES.saturate.max,
                      unit: '%'
                    },
                    {
                      label: 'Blur',
                      val: state.background.blur,
                      key: 'blur' as const,
                      max: FILTER_RANGES.blur.max,
                      unit: 'px'
                    },
                  ].map((control) => (
                    <div key={control.key}>
                      <div className="flex justify-between text-xs mb-1 text-slate-300">
                        <span>{control.label}</span>
                        <span>{control.val}{control.unit}</span>
                      </div>
                      <input
                        type="range"
                        min={FILTER_RANGES[control.key].min}
                        max={control.max}
                        value={control.val}
                        onChange={(e) => onUpdateBackground({ [control.key]: Number(e.target.value) })}
                        className="w-full accent-neon-cyan h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}

                  <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-300"><span>Overlay Opacity</span><span>{(state.background.overlayOpacity * 100).toFixed(0)}%</span></div>
                     <input type="range" min="0" max="1" step="0.05" value={state.background.overlayOpacity}
                      onChange={(e) => onUpdateBackground({ overlayOpacity: Number(e.target.value) })}
                      className="w-full accent-neon-cyan h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                   <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-300"><span>Overlay Color</span></div>
                     <div className="flex gap-2 flex-wrap">
                        {OVERLAY_COLOR_PRESETS.map(c => (
                          <button
                            key={c}
                            onClick={() => onUpdateBackground({ overlayColor: c })}
                            className={`w-6 h-6 rounded-full border border-slate-600 ${state.background.overlayColor === c ? 'ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                     </div>
                  </div>
                </div>
              </div>

              {/* Layer List in Backdrop for Overview */}
              <div className="pt-4 border-t border-slate-800">
                 <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Layers</h3>
                 <div className="space-y-2">
                   {state.layers.slice().reverse().map((layer) => (
                     <div
                       key={layer.id}
                       onClick={() => onSelectLayer(layer.id)}
                       className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${
                         state.selectedLayerId === layer.id ? 'bg-slate-800 border-neon-cyan' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                       }`}
                     >
                       {layer.type === 'text' ? <TypeIcon size={14} className="text-slate-500" /> : <Images size={14} className="text-slate-500" />}
                       <span className="text-xs truncate flex-1 text-slate-300 font-mono">
                         {layer.type === 'text' ? (layer as TextLayer).text : 'Image Layer'}
                       </span>
                     </div>
                   ))}
                   {state.layers.length === 0 && <div className="text-xs text-slate-600 italic">No layers added.</div>}
                 </div>
              </div>
          </div>
        )}

        {/* LAYER TAB */}
        {activeTab === 'layer' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {!selectedLayer ? (
              <div className="text-center py-10 opacity-50">
                <Sliders className="mx-auto mb-3" size={32} />
                <p className="text-sm">Select a layer to edit properties</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                   <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                     Edit {selectedLayer.type === 'text' ? 'Text' : 'Image'}
                   </h3>
                   <button onClick={() => onDeleteLayer(selectedLayer.id)} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-colors">
                    <Trash2 size={16} />
                   </button>
                </div>

                {/* TEXT SPECIFIC CONTROLS */}
                {selectedLayer.type === 'text' && (
                  <>
                    <textarea
                      value={(selectedLayer as TextLayer).text}
                      onChange={(e) => onUpdateLayer(selectedLayer.id, { text: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-neon-pink outline-none resize-y"
                      rows={3}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Font</label>
                        <select
                          value={(selectedLayer as TextLayer).fontFamily}
                          onChange={(e) => onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value as FontFamily })}
                          className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-sm text-white"
                        >
                          {FONT_FAMILIES.map(font => (
                            <option key={font.value} value={font.value}>{font.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Weight</label>
                        <select
                          value={(selectedLayer as TextLayer).fontWeight}
                          onChange={(e) => onUpdateLayer(selectedLayer.id, { fontWeight: Number(e.target.value) })}
                          className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-sm text-white"
                        >
                          {FONT_WEIGHTS.map(weight => (
                            <option key={weight.value} value={weight.value}>{weight.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Color</label>
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {TEXT_COLOR_PRESETS.map(c => (
                            <button
                              key={c}
                              onClick={() => onUpdateLayer(selectedLayer.id, { color: c })}
                              className={`w-8 h-8 rounded-full border border-slate-600 flex-shrink-0 ${(selectedLayer as TextLayer).color === c ? 'ring-2 ring-white' : ''}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <input
                            type="color"
                            value={(selectedLayer as TextLayer).color}
                            onChange={(e) => onUpdateLayer(selectedLayer.id, { color: e.target.value })}
                            className="w-8 h-8 rounded overflow-hidden p-0 border-0"
                          />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 text-slate-300"><span>Size</span><span>{(selectedLayer as TextLayer).fontSize}px</span></div>
                        <input
                          type="range"
                          min={LAYER_RANGES.fontSize.min}
                          max={LAYER_RANGES.fontSize.max}
                          value={(selectedLayer as TextLayer).fontSize}
                          onChange={(e) => onUpdateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                          className="w-full accent-neon-pink h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="uppercase"
                        checked={(selectedLayer as TextLayer).uppercase}
                        onChange={(e) => onUpdateLayer(selectedLayer.id, { uppercase: e.target.checked })}
                        className="w-4 h-4 rounded accent-neon-pink"
                      />
                      <label htmlFor="uppercase" className="text-sm text-slate-300">Uppercase</label>
                    </div>

                     <div>
                      <div className="flex justify-between text-xs mb-1 text-slate-300"><span>Stroke</span><span>{(selectedLayer as TextLayer).strokeWidth}px</span></div>
                       <div className="flex gap-2">
                          <input
                            type="range"
                            min={LAYER_RANGES.strokeWidth.min}
                            max={LAYER_RANGES.strokeWidth.max}
                            value={(selectedLayer as TextLayer).strokeWidth}
                            onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })}
                            className="flex-1 accent-neon-pink h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer self-center"
                          />
                          <input
                              type="color"
                              value={(selectedLayer as TextLayer).strokeColor}
                              onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeColor: e.target.value })}
                              className="w-8 h-6 rounded border-0 p-0 bg-transparent"
                            />
                       </div>
                    </div>
                  </>
                )}

                {/* IMAGE SPECIFIC CONTROLS */}
                {selectedLayer.type === 'image' && (
                   <>
                      <div>
                        <div className="flex justify-between text-xs mb-1 text-slate-300"><span>Width</span><span>{(selectedLayer as ImageLayer).width}px</span></div>
                        <input type="range" min="50" max="1000" value={(selectedLayer as ImageLayer).width}
                          onChange={(e) => {
                             const l = selectedLayer as ImageLayer;
                             const ratio = l.height / l.width;
                             const newWidth = Number(e.target.value);
                             onUpdateLayer(selectedLayer.id, { width: newWidth, height: newWidth * ratio });
                          }}
                          className="w-full accent-neon-pink h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div>
                         <div className="flex justify-between text-xs mb-1 text-slate-300"><span>Border</span><span>{(selectedLayer as ImageLayer).borderWidth || 0}px</span></div>
                         <div className="flex gap-2">
                            <input type="range" min="0" max="20" value={(selectedLayer as ImageLayer).borderWidth || 0}
                              onChange={(e) => onUpdateLayer(selectedLayer.id, { borderWidth: Number(e.target.value) })}
                              className="flex-1 accent-neon-pink h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer self-center"
                            />
                            <input
                                type="color"
                                value={(selectedLayer as ImageLayer).borderColor || '#ffffff'}
                                onChange={(e) => onUpdateLayer(selectedLayer.id, { borderColor: e.target.value })}
                                className="w-8 h-6 rounded border-0 p-0 bg-transparent"
                              />
                         </div>
                      </div>
                   </>
                )}

                {/* COMMON CONTROLS */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                    <div>
                       <div className="flex justify-between text-xs mb-1 text-slate-300"><span>Rotation</span><span>{selectedLayer.rotation}°</span></div>
                        <input type="range" min="-180" max="180" value={selectedLayer.rotation}
                          onChange={(e) => onUpdateLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
                          className="w-full accent-neon-pink h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                       <div className="flex justify-between text-xs mb-1 text-slate-300"><span>Opacity</span><span>{(selectedLayer.opacity * 100).toFixed(0)}%</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={selectedLayer.opacity}
                          onChange={(e) => onUpdateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-neon-pink h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="pt-2">
                        <h4 className="text-xs text-slate-400 mb-2 font-bold">Shadow</h4>
                        {selectedLayer.shadow ? (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <button onClick={() => onUpdateLayer(selectedLayer.id, { shadow: null })} className="text-xs text-red-400 border border-red-900 bg-red-900/20 px-2 py-1 rounded">Remove Shadow</button>
                                </div>
                                 <div className="flex justify-between text-xs text-slate-300"><span>Blur</span></div>
                                 <input type="range" min="0" max="50" value={selectedLayer.shadow.blur}
                                    onChange={(e) => selectedLayer.shadow && onUpdateLayer(selectedLayer.id, { shadow: { ...selectedLayer.shadow, blur: Number(e.target.value) } })}
                                    className="w-full accent-neon-pink h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                 />
                                  <div className="flex justify-between text-xs text-slate-300"><span>Color</span></div>
                                  <input
                                    type="color"
                                    value={selectedLayer.shadow.color}
                                    onChange={(e) => selectedLayer.shadow && onUpdateLayer(selectedLayer.id, { shadow: { ...selectedLayer.shadow, color: e.target.value } })}
                                    className="w-full h-6 rounded bg-slate-700 border-0 p-0"
                                  />
                            </div>
                        ) : (
                             <button
                                onClick={() => onUpdateLayer(selectedLayer.id, { shadow: { blur: 10, color: '#000000', offsetX: 5, offsetY: 5 } })}
                                className="w-full py-2 bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 rounded border border-slate-700"
                             >
                                Add Drop Shadow
                             </button>
                        )}
                    </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900 shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => onAddLayer()}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-white text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={16} />
            Text
          </button>

          <label className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-white text-sm font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer">
             <Images size={16} />
             Image
             <input type="file" className="hidden" accept="image/*" onChange={onAddImageLayer} />
          </label>
        </div>

        <button
          onClick={onExport}
          className="w-full py-3 bg-gradient-to-r from-neon-pink to-purple-600 rounded text-white font-bold hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-shadow flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Export
        </button>
      </div>
    </div>
  );
});
