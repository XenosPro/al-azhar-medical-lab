/**
 * LabVision: local-only, experimental blood-cell image classification.
 * The exported MobileNetV2 graph already contains preprocess_input,
 * so the input stays RGB float32 with pixel values in the 0–255 range.
 */
import type { GraphModel, Tensor } from "@tensorflow/tfjs";

export type BloodCellLabel = "Parasitized" | "Uninfected";

export type BloodCellResult = {
  label: BloodCellLabel;
  uninfectedScore: number;
  parasitizedScore: number;
};

type ModelBundle = {
  tf: typeof import("@tensorflow/tfjs");
  model: GraphModel;
};

let modelPromise: Promise<ModelBundle> | null = null;

export function loadBloodCellModel(): Promise<ModelBundle> {
  if (!modelPromise) {
    modelPromise = import("@tensorflow/tfjs")
      .then(async (tf) => {
        await tf.ready();
        // BASE_URL keeps the asset path compatible with a configured Vite base.
        const modelUrl = `${import.meta.env.BASE_URL}models/blood-cell/model.json`;
        const model = await tf.loadGraphModel(modelUrl);
        const shape = model.inputs[0]?.shape;
        if (!shape || shape[1] !== 160 || shape[2] !== 160 || shape[3] !== 3) {
          model.dispose();
          throw new Error("Unexpected model input shape; expected 160×160 RGB.");
        }
        return { tf, model };
      })
      .catch((error: unknown) => {
        modelPromise = null; // Permit retry after network/model-load errors.
        throw error;
      });
  }
  return modelPromise;
}

export async function classifyBloodCell(file: File): Promise<BloodCellResult> {
  const { tf, model } = await loadBloodCellModel();
  const imageUrl = URL.createObjectURL(file);
  let input: Tensor | undefined;
  let outputs: Tensor[] = [];

  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    input = tf.tidy(() => {
      const pixels = tf.browser.fromPixels(image, 3);
      // Keep 0–255 pixel values: the graph contains MobileNetV2 preprocessing.
      return tf.image.resizeBilinear(pixels, [160, 160]).toFloat().expandDims(0);
    });

    const prediction = await model.executeAsync(input);
    outputs = Array.isArray(prediction)
      ? prediction
      : prediction instanceof tf.Tensor
        ? [prediction]
        : Object.values(prediction);

    if (outputs.length !== 1 || outputs[0].size !== 1) {
      throw new Error("Unexpected model output; expected one sigmoid score.");
    }

    const uninfectedScore = (await outputs[0].data())[0];
    if (!Number.isFinite(uninfectedScore) || uninfectedScore < 0 || uninfectedScore > 1) {
      throw new Error("The model returned an invalid score.");
    }

    return {
      label: uninfectedScore >= 0.5 ? "Uninfected" : "Parasitized",
      uninfectedScore,
      parasitizedScore: 1 - uninfectedScore,
    };
  } finally {
    input?.dispose();
    outputs.forEach((tensor) => tensor.dispose());
    URL.revokeObjectURL(imageUrl);
  }
}
