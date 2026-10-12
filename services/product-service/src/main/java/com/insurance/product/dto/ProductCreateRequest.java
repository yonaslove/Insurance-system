package com.insurance.product.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductCreateRequest(
    @NotBlank(message = "Product code is mandatory")
    @Size(max = 50)
    String code,

    @NotBlank(message = "Product name is mandatory")
    @Size(max = 200)
    String name,

    @NotBlank(message = "Description is mandatory")
    String description,

    @NotBlank(message = "Category is mandatory")
    String category,

    @NotNull(message = "Base premium is mandatory")
    @DecimalMin(value = "0.01", message = "Base premium must be positive")
    BigDecimal basePremium,

    Boolean active
) {}
