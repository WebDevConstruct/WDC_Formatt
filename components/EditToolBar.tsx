import { Bold, Underline, ListOrdered, List } from 'lucide-react';

export const EditToolbar = ({ target, onUpdate, updateListStyle }: any) => {
  const isList = target.role === 'lists';
  const isText = target.role === 'paragraph' || target.role === 'subheader';

  return (
    <div className="flex items-center gap-1 p-1 bg-black text-white rounded-md border border-white/10 shadow-xl">
      {/* Text Controls (Bold/Underline) - Only for Paragraphs/Subheaders */}
      {isText && (
        <>
          <button onClick={() => onUpdate({ isBold: !target.isBold })} 
                  className={`p-1.5 rounded ${target.isBold ? 'bg-white text-black' : 'hover:bg-white/20'}`}>
            <Bold size={14} />
          </button>
          <button onClick={() => onUpdate({ isUnderline: !target.isUnderline })} 
                  className={`p-1.5 rounded ${target.isUnderline ? 'bg-white text-black' : 'hover:bg-white/20'}`}>
            <Underline size={14} />
          </button>
        </>
      )}

      {/* List Controls - Only for Lists */}
      {isList && (
        <div className="flex gap-1">
          <button onClick={() => updateListStyle('bullet')} className="p-1.5 hover:bg-white/20 rounded">
            <List size={14} />
          </button>
          <button onClick={() => updateListStyle('number')} className="p-1.5 hover:bg-white/20 rounded">
            <ListOrdered size={14} />
          </button>
        </div>
      )}
    </div>
  );
};