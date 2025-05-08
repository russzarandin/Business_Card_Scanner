package com.babschiin.frontend

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import org.pytorch.Module
import org.pytorch.Tensor
import org.pytorch.IValue

@ReactModule(name = ExecutorModule.NAME)
class ExecutorModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

        companion object {
            const val NAME = "ExecutorModule"
            private var modelCache: MutableMap<String, Module> = mutableMapOf()
        }

        override fun getName(): String {
            return NAME
        }

        @ReactMethod
        fun loadModel(modelPath: String, modelId: String, promise: Promise) {
            try {
                val model = Module.load(modelPath)
                modelCache[modelId] = model
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("LOAD_ERROR", "Failed to load model: ${e.message}")
            }
        }

        @ReactMethod
        fun runModel(modelId: String, input: ReadableArray, promise: Promise) {
            try {
                val model = modelCache[modelId] ?: throw Exception("Model not loaded")
                val inputTensor = tensorFromJSArray(input)
                val output = model.forward(IValue.from(inputTensor))
                val outputTensor = output.toTensor()
                val outputData = outputTensor.dataAsFloatArray.toList()
                promise.resolve(Arguments.fromList(outputData))
            } catch (e: Exception) {
                promise.reject("INFERENCE_ERROR", "Failed to run model: ${e.message}")
            }
        }

        private fun tensorFromJSArray(array: ReadableArray): Tensor {
            val floatList = mutableListOf<Float>()
            for (i in 0 until array.size()) {
                floatList.add(array.getDouble(i).toFloat())
            }
            return Tensor.fromBlob(floatList.toFloatArray(), longArrayOf(1, 3, 640, 640))
        }
    }