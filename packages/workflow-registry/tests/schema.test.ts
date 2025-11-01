/**
 * Tests for schema validation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SchemaValidator, ParameterType } from '../src/schema.js';

describe('SchemaValidator', () => {
  describe('String validation', () => {
    it('should validate string type', () => {
      const schema = { type: ParameterType.STRING, required: true };
      const result = SchemaValidator.validate('test', schema);
      assert.equal(result.valid, true);
    });

    it('should fail for non-string values', () => {
      const schema = { type: ParameterType.STRING, required: true };
      const result = SchemaValidator.validate(123, schema);
      assert.equal(result.valid, false);
      assert.equal(result.errors[0].message, 'Value must be a string');
    });

    it('should validate string length', () => {
      const schema = {
        type: ParameterType.STRING,
        minLength: 3,
        maxLength: 10,
      };

      assert.equal(SchemaValidator.validate('ab', schema).valid, false);
      assert.equal(SchemaValidator.validate('abc', schema).valid, true);
      assert.equal(SchemaValidator.validate('12345678901', schema).valid, false);
    });

    it('should validate string pattern', () => {
      const schema = {
        type: ParameterType.STRING,
        pattern: '^[a-z]+$',
      };

      assert.equal(SchemaValidator.validate('abc', schema).valid, true);
      assert.equal(SchemaValidator.validate('ABC', schema).valid, false);
      assert.equal(SchemaValidator.validate('abc123', schema).valid, false);
    });

    it('should validate string enum', () => {
      const schema = {
        type: ParameterType.STRING,
        enum: ['red', 'green', 'blue'],
      };

      assert.equal(SchemaValidator.validate('red', schema).valid, true);
      assert.equal(SchemaValidator.validate('yellow', schema).valid, false);
    });
  });

  describe('Number validation', () => {
    it('should validate number type', () => {
      const schema = { type: ParameterType.NUMBER, required: true };
      assert.equal(SchemaValidator.validate(123, schema).valid, true);
      assert.equal(SchemaValidator.validate('123', schema).valid, false);
    });

    it('should validate number range', () => {
      const schema = {
        type: ParameterType.NUMBER,
        min: 0,
        max: 100,
      };

      assert.equal(SchemaValidator.validate(-1, schema).valid, false);
      assert.equal(SchemaValidator.validate(50, schema).valid, true);
      assert.equal(SchemaValidator.validate(101, schema).valid, false);
    });

    it('should validate integer', () => {
      const schema = {
        type: ParameterType.NUMBER,
        integer: true,
      };

      assert.equal(SchemaValidator.validate(10, schema).valid, true);
      assert.equal(SchemaValidator.validate(10.5, schema).valid, false);
    });
  });

  describe('Boolean validation', () => {
    it('should validate boolean type', () => {
      const schema = { type: ParameterType.BOOLEAN };
      assert.equal(SchemaValidator.validate(true, schema).valid, true);
      assert.equal(SchemaValidator.validate(false, schema).valid, true);
      assert.equal(SchemaValidator.validate('true', schema).valid, false);
    });
  });

  describe('Object validation', () => {
    it('should validate object type', () => {
      const schema = { type: ParameterType.OBJECT };
      assert.equal(SchemaValidator.validate({}, schema).valid, true);
      assert.equal(SchemaValidator.validate([], schema).valid, false);
      // null is treated as valid when not required
      assert.equal(SchemaValidator.validate(null, schema).valid, true);
    });

    it('should validate object properties', () => {
      const schema = {
        type: ParameterType.OBJECT,
        properties: {
          name: { type: ParameterType.STRING, required: true },
          age: { type: ParameterType.NUMBER },
        },
      };

      const validObj = { name: 'John', age: 30 };
      assert.equal(SchemaValidator.validate(validObj, schema).valid, true);

      const invalidObj = { age: 30 };
      assert.equal(SchemaValidator.validate(invalidObj, schema).valid, false);
    });

    it('should check additional properties', () => {
      const schema = {
        type: ParameterType.OBJECT,
        properties: {
          name: { type: ParameterType.STRING },
        },
        additionalProperties: false,
      };

      const validObj = { name: 'John' };
      assert.equal(SchemaValidator.validate(validObj, schema).valid, true);

      const invalidObj = { name: 'John', extra: 'value' };
      const result = SchemaValidator.validate(invalidObj, schema);
      assert.equal(result.valid, false);
      assert.ok(result.errors[0].message.includes('Additional property'));
    });
  });

  describe('Array validation', () => {
    it('should validate array type', () => {
      const schema = { type: ParameterType.ARRAY };
      assert.equal(SchemaValidator.validate([], schema).valid, true);
      assert.equal(SchemaValidator.validate({}, schema).valid, false);
    });

    it('should validate array items', () => {
      const schema = {
        type: ParameterType.ARRAY,
        items: { type: ParameterType.STRING },
      };

      assert.equal(SchemaValidator.validate(['a', 'b'], schema).valid, true);
      assert.equal(SchemaValidator.validate(['a', 1], schema).valid, false);
    });

    it('should validate array length', () => {
      const schema = {
        type: ParameterType.ARRAY,
        minItems: 1,
        maxItems: 3,
      };

      assert.equal(SchemaValidator.validate([], schema).valid, false);
      assert.equal(SchemaValidator.validate([1, 2], schema).valid, true);
      assert.equal(SchemaValidator.validate([1, 2, 3, 4], schema).valid, false);
    });
  });

  describe('Required validation', () => {
    it('should validate required fields', () => {
      const schema = { type: ParameterType.STRING, required: true };

      assert.equal(SchemaValidator.validate(undefined, schema).valid, false);
      assert.equal(SchemaValidator.validate(null, schema).valid, false);
      assert.equal(SchemaValidator.validate('value', schema).valid, true);
    });

    it('should allow undefined for non-required fields', () => {
      const schema = { type: ParameterType.STRING, required: false };
      assert.equal(SchemaValidator.validate(undefined, schema).valid, true);
    });
  });

  describe('Any type validation', () => {
    it('should accept any value', () => {
      const schema = { type: ParameterType.ANY };

      assert.equal(SchemaValidator.validate('string', schema).valid, true);
      assert.equal(SchemaValidator.validate(123, schema).valid, true);
      assert.equal(SchemaValidator.validate(true, schema).valid, true);
      assert.equal(SchemaValidator.validate({}, schema).valid, true);
      assert.equal(SchemaValidator.validate([], schema).valid, true);
    });
  });
});
