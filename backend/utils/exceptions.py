class APKValidationError(Exception): pass
class FeatureExtractionError(Exception): pass
class FeatureMappingError(Exception): pass
class ModelPredictionError(Exception): pass
class DynamicAnalysisError(Exception): pass
class EmulatorError(DynamicAnalysisError): pass
class FridaError(DynamicAnalysisError): pass
