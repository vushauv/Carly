package pw.react.backend.dto.request.car;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class CarFeatureDto {
    private Integer dictionaryId; // TypeDictionaryId
    private String value;
}


// Create Car Form:
// Model(id = 1): ___
// Brand(id = 2): ___
// Fuel(id = 3): ___
// Color: ___
// Price(id = 5): ___

// POST /cars:
// {carFeatures: [{id: 1, value: "M3"}, {id: 2, value: "BMW"}, {id: 5, value: 100}]}

// query CarFeature Where dictionaryId = 1 AND value = "M3" -> 1. If exists - reuse the id of CarFeature. 2. If it does not exist - create a CarFeature record

//DB:
// carToFeatureId = 1, {id: 1, value: "M3"}; carToFeatureId = 2, {id: 2, value: "BMW"}

//{carFeatures: [{id: 1, value: "M4"}, {id: 2, value: "BMW"}]
// carToFeatureId = 3, {id: 1, value: "M4"}

// Before form submission: we have to retrieve all CarFeatureDictionary, CarFeatureValues
// If match: {carFeatures: [1, 2, 3, 4, 5]}

// Frotnend Receives: Brand: [BMW = 1, mErcedes =2,  Porsche = 3]
// Color: [Yellow = 1, Green = 2]

// Color = Yellow, Brand = BMW
// The payload sent: {carFeature: [{dictionaryId: 4, dictionaryValue = 1}, {dictionaryId: 2, dictionaryValue = 1}]}

// Id: 1, Id: 2 ->
