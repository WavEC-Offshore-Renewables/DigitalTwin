/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { assert, expect } from "chai";
import { Guid, GuidString, Id64, Id64Arg, Id64Array } from "../bentleyjs-core";

class Uint64Id {
  public constructor(public readonly high: number,
    public readonly low: number,
    public readonly localId: number,
    public readonly briefcaseId: number,
    public readonly str: string) { }
}

describe("Ids", () => {

  it("Id64 should construct properly", () => {
    const id1 = Id64.fromJSON("0x123");
    assert.isTrue(Id64.isValidId64(id1), "good");
    assert.equal(id1, "0x123");
    assert.equal(id1, "0x123");
    assert.equal(Id64.getBriefcaseId(id1), 0);
    assert.equal(Id64.getLocalId(id1), 0x123);
    const one = Id64.fromJSON("0x1");
    assert.equal(one, "0x1");
    const badid = Id64.fromJSON("0");
    assert.isNotTrue(Id64.isValidId64(badid), "bad");
    assert.equal(badid, "0");
    const id2 = Id64.fromJSON("badness");
    assert.equal(id2, "0");
    assert.isNotTrue(Id64.isValidId64(id2));
    const id3 = Id64.fromJSON("0xtbadness");
    assert.isNotTrue(Id64.isValidId64(id3));
    assert.equal("0", id3);
    const id4 = Id64.fromJSON("0x1234567890abcdef");
    assert.isTrue(Id64.isValidId64(id4));
    assert.equal(Id64.getBriefcaseId(id4), 0x123456);
    assert.equal(Id64.getLocalId(id4), 0x7890abcdef);
    const i5 = "0x20000000011";
    const id5 = Id64.fromJSON(i5);
    assert.equal(Id64.getBriefcaseId(id5), 0x2);
    assert.equal(Id64.getLocalId(id5), 0x11);
    const i55 = Id64.fromLocalAndBriefcaseIds(0x11, 2);
    assert.isTrue(i55 === id5);
    const id6 = Id64.fromLocalAndBriefcaseIds(2000000, 3000);
    const v6 = id6;
    const id7 = Id64.fromJSON(v6);
    assert.isTrue(id6 === id7);
    const id8 = Id64.fromJSON(id7);
    assert.isTrue(id8 === id7);
    const abc: any = { a: 1, b: 2 };
    const id9 = Id64.fromJSON(abc);
    assert.isNotTrue(Id64.isValidId64(id9), "bad type");
    const id10 = Id64.fromLocalAndBriefcaseIds("a" as any, "b" as any);
    assert.isNotTrue(Id64.isValidId64(id10), "bad type");

    const t1 = { a: id7 };
    const j7 = JSON.stringify(t1);
    const p1 = JSON.parse(j7);
    const i8 = Id64.fromJSON(p1.a);
    assert(i8 === id7);
    assert.isTrue(i8 === id7);

    const id1A = Id64.fromJSON("0x1");
    const id1B = Id64.fromJSON(id1A);
    const id1C = Id64.fromJSON("0x01");
    const id1D = Id64.fromLocalAndBriefcaseIds(1, 0);
    assert.isTrue(id1A === id1B);
    assert.isTrue(id1A === id1C);
    assert.isTrue(id1A === id1D);

    const sameid = Id64.fromJSON(id1A);
    assert.isTrue(sameid === id1A, "fromJSON with an Id64 should return value");
    const differentId = Id64.fromJSON("0x1");
    assert.isTrue(differentId === id1A, "fromJSON with string should return same string");

    // tests for Id64.toIdSet
    let idset = Id64.toIdSet(id1A);
    assert.instanceOf(idset, Set);
    assert.equal(idset.size, 1, "from Id64");
    assert.isTrue(idset.has(id1A));

    idset = Id64.toIdSet([id1A, id6, i55, id8, i55]);
    assert.instanceOf(idset, Set);
    assert.equal(idset.size, 3, "from string[]");
    assert.isTrue(idset.has(i55));

    idset = Id64.toIdSet([id1A, id6, i55, id8, i55]);
    assert.instanceOf(idset, Set);
    assert.equal(idset.size, 3, "from Id64[]");
    assert.isTrue(idset.has(i55));

    idset = Id64.toIdSet(i55);
    assert.instanceOf(idset, Set);
    assert.equal(idset.size, 1, "from string");
    assert.isTrue(idset.has(i55));

    const idset2 = Id64.toIdSet(idset);
    assert.equal(idset2, idset, "from IdSet");
  });

  it("should construct an Id64 from two 32-bit integers", () => {
    const ids: Uint64Id[] = [
      // (highBytes, lowBytes, localId, briefCaseId, Id64String)
      new Uint64Id(0, 0, 0, 0, "0"),
      new Uint64Id(0x01234567, 0x89abcdef, 0x6789abcdef, 0x00012345, "0x123456789abcdef"),
      new Uint64Id(0xfedcba98, 0x76543210, 0x9876543210, 0x00fedcba, "0xfedcba9876543210"),
      new Uint64Id(0x00000100, 0x00000001, 0x0000000001, 0x00000001, "0x10000000001"),
      new Uint64Id(0x12345600, 0, 0, 0, "0"), // a local ID of zero is not allowed
      new Uint64Id(0, 0x0000123456, 0x123456, 0, "0x123456"), // leading zeroes in local ID omitted if briefcase Id is zero
      new Uint64Id(0x100, 1, 1, 1, "0x10000000001"), // preserve leading zeroes in local Id if briefcase Id non-zero
      new Uint64Id(1, 1, 0x0100000001, 0, "0x100000001"), // lower 8 bytes of "high uint32" are part of local ID, not briefcase ID.
      new Uint64Id(0x00ba0000, 0x6543000, 0x6543000, 0xba00, "0xba000006543000"),
    ];

    for (const id of ids) {
      const id64 = Id64.fromUint32Pair(id.low, id.high);
      expect(id64).to.equal(id.str);
      if (Id64.isInvalid(id.str)) {
        // If we expect invalid ID for whatever inputs, then expect extraction to operate on invalid ID
        expect(Id64.getLocalId(id64)).to.equal(id.localId);
        expect(Id64.getBriefcaseId(id64)).to.equal(id.briefcaseId);
        expect(Id64.getLowerUint32(id64)).to.equal(0);
        expect(Id64.getUpperUint32(id64)).to.equal(0);
      } else {
        expect(Id64.getLocalId(id64)).to.equal(id.localId);
        expect(Id64.getBriefcaseId(id64)).to.equal(id.briefcaseId);

        const low = Id64.getLowerUint32(id64);
        const high = Id64.getUpperUint32(id64);
        expect(low).to.equal(id.low);
        expect(high).to.equal(id.high);
      }
    }
  });

  it("should validate well-formed Id64Strings", () => {
    const goodIds = [
      "0",
      "0x12345678ab",
      "0xcdef987654",
      "0x1",
      "0xa",
      "0xa000000000",
      "0x10000000001",
      "0x11000000000",
      "0xfffffe0000000001",
    ];

    const badIds = [
      "0x0",
      "0x01",
      "0X1",
      "0xg",
      "0x12345678AB",
      "0xCDEF987654",
      "0xffffff0000000000",
      "0xffffffD000000000",
      "0xh0000000001",
      "0xh000000000000001",
      "0x1h00000000000000",
      "0x100000000000000h",
      "0x112233445566778899aabb",
    ];

    for (const goodId of goodIds) {
      assert.isTrue(Id64.isId64(goodId), goodId);
      if ("0" !== goodId)
        assert.isTrue(Id64.isValidId64(goodId), goodId);
    }

    for (const badId of badIds) {
      assert.isFalse(Id64.isId64(badId), badId);
      assert.isFalse(Id64.isValidId64(badId), badId);
    }
  });

  it("should construct an Id64.Uint32Set from Id64Arg", () => {
    const test = (arg: Id64Arg) => {
      const uint32Set = new Id64.Uint32Set(arg);
      expect(uint32Set.size).to.equal(Id64.sizeOf(arg));
      Id64.forEach(arg, (id) => {
        expect(uint32Set.hasId(id)).to.be.true;

        // While we're here, test Id64.has()
        expect(Id64.has(arg, id)).to.be.true;
      });
    };

    test("0x123");
    test("0x1234567890ab");
    test([]);
    test(["0x123"]);
    test(["0x1", "0x2", "0x3", "0xfffffff"]);
    test(new Set<string>());
    test(new Set<string>(["0x123"]));
    test(new Set<string>(["0x1", "0x2", "0x3", "0xfffffff"]));
  });

  it("should store IDs in a Id64.Uint32Set", () => {
    const ids: Uint64Id[] = [
      // (highBytes, lowBytes, localId, briefCaseId, Id64String)
      new Uint64Id(0, 0, 0, 0, "0"),
      new Uint64Id(0, 1, 1, 0, "0x1"),
      new Uint64Id(0, 2, 2, 0, "0x2"),
      new Uint64Id(0, 0x0000123456, 0x123456, 0, "0x123456"),
      new Uint64Id(0, 0x01234567, 0x01234567, 0, "0x1234567"),
      new Uint64Id(0, 0xffffffff, 0xffffffff, 0, "0xffffffff"),
      new Uint64Id(0x01234567, 0x89abcdef, 0x6789abcdef, 0x00012345, "0x123456789abcdef"),
      new Uint64Id(0xfedcba98, 0x76543210, 0x9876543210, 0x00fedcba, "0xfedcba9876543210"),
      new Uint64Id(0x100, 1, 1, 1, "0x10000000001"),
      new Uint64Id(0x100, 0xabc, 0xabc, 1, "0x10000000abc"),
      new Uint64Id(1, 1, 0x0100000001, 0, "0x100000001"),
      new Uint64Id(1, 2, 0x0100000002, 0, "0x100000002"),
      new Uint64Id(0x00ba0000, 0x6543000, 0x6543000, 0xba00, "0xba000006543000"),
    ];

    class MySet extends Id64.Uint32Set {
      public get map() { return this._map; }
    }

    const set = new MySet();
    for (const id of ids) {
      set.add(id.low, id.high);
      set.add(id.low, id.high);
    }

    expect(set.size).to.equal(ids.length);
    expect(set.map.size).to.equal(6); // number of unique "high bytes" values.

    for (const id of ids) {
      expect(set.has(id.low, id.high)).to.be.true;
      expect(set.hasId(id.str)).to.be.true;
    }

    set.clear();
    expect(set.isEmpty).to.be.true;
    expect(set.size).to.equal(0);

    for (const id of ids) {
      set.addId(id.str);
      set.add(id.low, id.high);
    }

    expect(set.size).to.equal(ids.length);
    expect(set.map.size).to.equal(6); // number of unique "high bytes" values.

    for (const id of ids) {
      expect(set.has(id.low, id.high)).to.be.true;
      expect(set.hasId(id.str)).to.be.true;
    }

    const iterated = new Set<string>();
    set.forEach((lo: number, hi: number) => {
      expect(set.has(lo, hi)).to.be.true;
      const str = lo.toString() + hi.toString();
      expect(iterated.has(str)).to.be.false;
      iterated.add(str);
    });

    expect(iterated.size).to.equal(set.size);
  });

  it("should map IDs in a Id64.Uint32Map", () => {
    const ids: Uint64Id[] = [
      // (highBytes, lowBytes, localId, briefCaseId, Id64String)
      new Uint64Id(0, 0, 0, 0, "0"),
      new Uint64Id(0, 1, 1, 0, "0x1"),
      new Uint64Id(0, 2, 2, 0, "0x2"),
      new Uint64Id(0, 0x0000123456, 0x123456, 0, "0x123456"),
      new Uint64Id(0, 0x01234567, 0x01234567, 0, "0x1234567"),
      new Uint64Id(0, 0xffffffff, 0xffffffff, 0, "0xffffffff"),
      new Uint64Id(0x01234567, 0x89abcdef, 0x6789abcdef, 0x00012345, "0x123456789abcdef"),
      new Uint64Id(0xfedcba98, 0x76543210, 0x9876543210, 0x00fedcba, "0xfedcba9876543210"),
      new Uint64Id(0x100, 1, 1, 1, "0x10000000001"),
      new Uint64Id(0x100, 0xabc, 0xabc, 1, "0x10000000abc"),
      new Uint64Id(1, 1, 0x0100000001, 0, "0x100000001"),
      new Uint64Id(1, 2, 0x0100000002, 0, "0x100000002"),
      new Uint64Id(0x00ba0000, 0x6543000, 0x6543000, 0xba00, "0xba000006543000"),
    ];

    class MyMap<T> extends Id64.Uint32Map<T> {
      public get map() { return this._map; }
    }

    const strings = new MyMap<string>();
    for (const id of ids)
      strings.set(id.low, id.high, id.str);

    expect(strings.size).to.equal(ids.length);
    expect(strings.map.size).to.equal(6);

    for (const id of ids) {
      let value = strings.get(id.low, id.high);
      expect(value).not.to.be.undefined;
      expect(value).to.equal(id.str);

      value = strings.getById(id.str);
      expect(value).not.to.be.undefined;
      expect(value).to.equal(id.str);
    }

    const iterated = new Set<string>();
    strings.forEach((lo: number, hi: number, value: string) => {
      expect(strings.get(lo, hi)).to.equal(value);
      const str = lo.toString() + hi.toString();
      expect(iterated.has(str)).to.be.false;
      iterated.add(str);
    });

    expect(iterated.size).to.equal(strings.size);

    const numbers = new MyMap<number>();
    for (const id of ids)
      numbers.setById(id.str, id.low);

    expect(numbers.size).to.equal(ids.length);
    expect(numbers.map.size).to.equal(6);

    for (const id of ids) {
      let value = numbers.get(id.low, id.high);
      expect(value).not.to.be.undefined;
      expect(value).to.equal(id.low);

      value = numbers.getById(id.str);
      expect(value).not.to.be.undefined;
      expect(value).to.equal(id.low);
    }
  });

  it("Guids", () => {
    const v1: GuidString = "274e25dc-8407-11e7-bb31-be2e44b06b34"; // a valid v1 id
    const v4: GuidString = "3d04156c-4faa-4eac-b20e-353a9e6c0183"; // a valid v4 id
    assert.isTrue(Guid.isGuid(v1));
    assert.isFalse(Guid.isV4Guid(v1));
    assert.isTrue(Guid.isV4Guid(v4));

    assert.equal(JSON.stringify(v4), `"${v4}"`);
    assert.isFalse(Guid.isGuid("0x123"));
    assert.isFalse(Guid.isGuid("badstuff"));
    assert.isFalse(Guid.isGuid("3d04156c-4faa-4eac-b20e-353a9e6c0183d")); // too long
    assert.isFalse(Guid.isGuid("3d04156c-4faa-4eac-b20e-353a9e6c018r")); // "r" is invalid
    assert.isTrue(Guid.isGuid("3d04156C-4fAa-4eac-b20e-353a9e6c018F")); // should accept uppercase characters
    assert.isFalse(Guid.isGuid(""));

    const id1: GuidString = Guid.createValue();
    const id2: GuidString = Guid.createValue();
    assert.isTrue(Guid.isGuid(id1));
    assert.isTrue(Guid.isV4Guid(id2));
    assert.notEqual(id1, id2);

    // Cases that can be normalized
    assert.equal(Guid.normalize(v1), v1);
    assert.equal(Guid.normalize(v1.toUpperCase()), v1);
    assert.equal(Guid.normalize(v1.replace(/-/g, "")), v1);
    assert.equal(Guid.normalize("12345678123412341234123456789ABC"), "12345678-1234-1234-1234-123456789abc");
    assert.equal(Guid.normalize("1-234567812-341-234-123412345-67-89A-BC"), "12345678-1234-1234-1234-123456789abc");
    assert.equal(Guid.normalize("  1-234567812-341-234-123412345-67-89A-BC  "), "12345678-1234-1234-1234-123456789abc");

    // Cases that cannot be normalized - string left unchanged
    assert.equal(Guid.normalize("12345678"), "12345678");
    assert.equal(Guid.normalize("12345678-1"), "12345678-1");
    assert.equal(Guid.normalize("123456781234"), "123456781234");
    assert.equal(Guid.normalize("12345678-1234-1"), "12345678-1234-1");
    assert.equal(Guid.normalize("1234567890123456789012345678901234567890"), "1234567890123456789012345678901234567890");
    assert.equal(Guid.normalize("BADguid"), "BADguid");
    assert.equal(Guid.normalize("12345678-1234-1234-1234-123456789ABCDEFG"), "12345678-1234-1234-1234-123456789ABCDEFG");
  });

  it("should compress and decompress sets of Ids", () => {
    const roundTrip = (ids: Id64Array, expected: string) => {
      // Round-trip the (sorted) array.
      const compressedArray = Id64.compressArray(ids);
      expect(compressedArray).to.equal(expected);

      const decompressedArray = Id64.decompressArray(compressedArray);
      expect(decompressedArray).to.deep.equal(ids);

      // Round-trip the Ids as a Set.
      const set = new Set<string>(ids);
      const compressedSet = Id64.compressSet(set);
      expect(compressedSet).to.equal(expected);

      const decompressedSet = Id64.decompressSet(compressedSet);
      expect(decompressedSet.size).to.equal(set.size);
      for (const id of decompressedSet)
        expect(set.has(id)).to.be.true;

      // The array is required to be sorted numerically.
      if (ids.length > 1) {
        const reversed = Array.from(ids).reverse();
        assert.throws(() => Id64.compressArray(reversed));
      }

      // Round-tripping removes duplicate Ids.
      const duplicates: string[] = [];
      ids.forEach((x) => { duplicates.push(x); duplicates.push(x); });
      const decompressedDuplicates = Id64.compressArray(duplicates);
      expect(decompressedDuplicates).to.equal(compressedArray);
    };

    const makeIds = (ids: number[]) => ids.map((x) => `0x${x.toString(16)}`);

    roundTrip(makeIds([2]), "+2");
    roundTrip(makeIds([1,5]), "+1+4");
    roundTrip(makeIds([3,7,8,10]), "+3+4+1+2");
    roundTrip(makeIds([0xFF, 0x150]), "+FF+51");

    roundTrip(makeIds([1,2,3,4,5]), "+1*5");
    roundTrip(makeIds([2,4,6,8]), "+2*4");
    roundTrip(makeIds([1,2,3,4,8,12,16]), "+1*4+4*3");
    roundTrip(makeIds([1,2,3,4,8,12,16,17]), "+1*4+4*3+1");

    roundTrip(makeIds([100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2100,2200,2300]), "+64*17");
    roundTrip(makeIds([1,10001,20001,30001,40001,50001,60001,70001,80001,90001,100001,110001,120001,130001,140001,150001,160001,170001,180001,190001,200001,210001,220001,230001, 230002]), "+1+2710*17+1");
    roundTrip(makeIds([0x21234567890, 0x31234567890, 0x41234567890, 0x61234567890]), "+21234567890+10000000000*2+20000000000");
    roundTrip(["0xabcdef0123456789", "0xabcdef1123456789"], "+ABCDEF0123456789+1000000000");
    roundTrip(["0xf0a0000000100", "0xf0a0000000120", "0xf0a0000000140", "0xf0a0000000202"], "+F0A0000000100+20*2+C2");

    roundTrip(["0xffffffffffffffff"], "+FFFFFFFFFFFFFFFF");
    roundTrip(["0x1", "0xffffffffffffffff"], "+1+FFFFFFFFFFFFFFFE");
    roundTrip(["0x1000000000000001", "0x4000000000000004", "0x7000000000000007", "0xa000007777777777"], "+1000000000000001+3000000000000003*2+3000007777777770");

    expect(Id64.compressArray(["0"])).to.equal("");
    expect(Id64.compressArray(["garbage", "0", "0x1", "0x4", "0", "0x5abc", "0x5xyz", "zzzzzzzz"])).to.equal("+1+3+5AB8");
  });
});
