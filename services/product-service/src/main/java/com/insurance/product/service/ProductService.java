package com.insurance.product.service;

import com.insurance.product.dto.ProductCreateRequest;
import com.insurance.product.dto.ProductDto;
import com.insurance.product.model.Product;
import com.insurance.product.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> listProducts() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(UUID id) {
        return productRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    @Transactional
    public ProductDto createProduct(ProductCreateRequest request) {
        if (productRepository.existsByCode(request.code())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A product with this code already exists");
        }

        Product product = new Product(
                UUID.randomUUID(),
                request.code(),
                request.name(),
                request.description(),
                request.category(),
                request.basePremium(),
                request.active() != null ? request.active() : true,
                OffsetDateTime.now()
        );

        return toDto(productRepository.save(product));
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getCode(),
                p.getName(),
                p.getDescription(),
                p.getCategory(),
                p.getBasePremium(),
                p.getActive(),
                p.getCreatedAt()
        );
    }
}
