import { useState } from "react";

export function ImageDropzone({
  preview,
  onImageSelect,
}: {
  preview?: string;
  onImageSelect: (file: File) => void;
}) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview SOLO para UI
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    // Enviar el File real al padre
    onImageSelect(file);
  };

  const imageSrc = localPreview ?? preview;

  return (
    <label className="border-2 border-dashed rounded-lg p-6 block cursor-pointer text-center">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Preview"
          className="max-h-40 mx-auto rounded object-contain"
        />
      ) : (
        <span className="text-sm text-muted-foreground">
          Arrastrá o hacé click para subir imagen
        </span>
      )}

      <input
        type="file"
        hidden
        accept="image/*"
        onChange={handleChange}
      />
    </label>
  );
}
