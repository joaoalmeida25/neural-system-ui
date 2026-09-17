import type {
  NeuralCoreConfigInput,
} from "../../../api/contracts/neural-core-config.types";
import type {
  NeuralCoreErrorHandler,
} from "../../../api/contracts/neural-core-error.types";
import type {
  NeuralCoreEventHandler,
} from "../../../api/contracts/neural-core-event.types";
import type {
  NeuralCoreInteractionBinding,
} from "../../../api/contracts/neural-core-interaction.types";
import type {
  NeuralCoreModelInput,
} from "../../../api/contracts/neural-core-model.types";
import type {
  NeuralCoreRuntimeInput,
} from "../../../api/contracts/neural-core-runtime.types";

export interface NeuralCoreBaseProps {
  readonly model: NeuralCoreModelInput;
  readonly config?: NeuralCoreConfigInput;
  readonly runtime?: NeuralCoreRuntimeInput;
  readonly onEvent?: NeuralCoreEventHandler;
  readonly onError?: NeuralCoreErrorHandler;
  readonly className?: string;
  readonly ariaLabel?: string;
}

export type NeuralCoreProps = NeuralCoreBaseProps & NeuralCoreInteractionBinding;
