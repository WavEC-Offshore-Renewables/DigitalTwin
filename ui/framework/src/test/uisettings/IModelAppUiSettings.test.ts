/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as sinon from "sinon";
import { expect } from "chai";
import { AuthorizedFrontendRequestContext, IModelApp, MockRender } from "@bentley/imodeljs-frontend";
import { SettingsAdmin, SettingsResult, SettingsStatus } from "@bentley/product-settings-client";
import { UiSettingsStatus } from "@bentley/ui-core";
import { IModelAppUiSettings, settingsStatusToUiSettingsStatus } from "../../ui-framework";
import { TestUtils } from "../TestUtils";

describe("IModelAppUiSettings", () => {
  const sandbox = sinon.createSandbox();

  before(async () => {
    await TestUtils.initializeUiFramework();
    await MockRender.App.startup();
  });

  after(async () => {
    await MockRender.App.shutdown();
  });

  beforeEach(() => {
    sandbox.stub(AuthorizedFrontendRequestContext, "create").resolves({} as AuthorizedFrontendRequestContext);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should save setting", async () => {
    const saveUserSetting = sandbox.stub<SettingsAdmin["saveUserSetting"]>().resolves(new SettingsResult(SettingsStatus.Success));
    sandbox.stub(IModelApp, "settings").get(() => ({
      saveUserSetting,
    }));
    sandbox.stub(IModelApp, "authorizationClient").get(() => ({ hasSignedIn: true }));
    const sut = new IModelAppUiSettings();
    await sut.saveSetting("TESTNAMESPACE", "TESTNAME", "testvalue");
    saveUserSetting.calledOnceWithExactly(sinon.match.any, "testvalue", "TESTNAMESPACE", "TESTNAME", true).should.true;
  });

  it("should delete setting", async () => {
    const deleteUserSetting = sandbox.stub<SettingsAdmin["deleteUserSetting"]>().resolves(new SettingsResult(SettingsStatus.Success));
    sandbox.stub(IModelApp, "settings").get(() => ({
      deleteUserSetting,
    }));
    sandbox.stub(IModelApp, "authorizationClient").get(() => ({ hasSignedIn: true }));
    const sut = new IModelAppUiSettings();
    await sut.deleteSetting("TESTNAMESPACE", "TESTNAME");
    deleteUserSetting.calledOnceWithExactly(sinon.match.any, "TESTNAMESPACE", "TESTNAME", true).should.true;
  });

  it("should get setting", async () => {
    const getUserSetting = sandbox.stub<SettingsAdmin["getUserSetting"]>().resolves(new SettingsResult(SettingsStatus.Success, undefined, "testvalue"));
    sandbox.stub(IModelApp, "settings").get(() => ({
      getUserSetting,
    }));
    sandbox.stub(IModelApp, "authorizationClient").get(() => ({ hasSignedIn: true }));
    const sut = new IModelAppUiSettings();
    const settingResult = await sut.getSetting("TESTNAMESPACE", "TESTNAME");
    getUserSetting.calledOnceWithExactly(sinon.match.any, "TESTNAMESPACE", "TESTNAME", true).should.true;
    settingResult.setting.should.eq("testvalue");
  });

  it("should fail to save setting", async () => {
    sandbox.stub(IModelApp, "authorizationClient").get(() => ({ hasSignedIn: false }));
    const sut = new IModelAppUiSettings();
    const result = await sut.saveSetting("TESTNAMESPACE", "TESTNAME", "testvalue");
    expect(result.status).to.eq(UiSettingsStatus.AuthorizationError);
  });

  it("should fail to delete setting", async () => {
    sandbox.stub(IModelApp, "authorizationClient").get(() => ({ hasSignedIn: false }));
    const sut = new IModelAppUiSettings();
    const result = await sut.deleteSetting("TESTNAMESPACE", "TESTNAME");
    expect(result.status).to.eq(UiSettingsStatus.AuthorizationError);
  });

  it("should fail to get setting", async () => {
    sandbox.stub(IModelApp, "authorizationClient").get(() => ({ hasSignedIn: false }));
    const sut = new IModelAppUiSettings();
    const result = await sut.getSetting("TESTNAMESPACE", "TESTNAME");
    expect(result.status).to.eq(UiSettingsStatus.AuthorizationError);
  });

});

describe("settingsStatusToUiSettingsStatus", () => {
  it("should return Success", () => {
    settingsStatusToUiSettingsStatus(SettingsStatus.Success).should.eq(UiSettingsStatus.Success);
  });

  it("should return NotFound", () => {
    settingsStatusToUiSettingsStatus(SettingsStatus.SettingNotFound).should.eq(UiSettingsStatus.NotFound);
  });

  it("should return AuthorizationError", () => {
    settingsStatusToUiSettingsStatus(SettingsStatus.AuthorizationError).should.eq(UiSettingsStatus.AuthorizationError);
  });

  it("should return UnknownError", () => {
    settingsStatusToUiSettingsStatus(SettingsStatus.UrlError).should.eq(UiSettingsStatus.UnknownError);
  });
});
