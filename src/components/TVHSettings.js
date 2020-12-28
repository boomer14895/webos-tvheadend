import React, { Component } from 'react';
import { Input, SIZE } from "baseui/input";
import { Button, KIND } from "baseui/button";
import TVHDataService from '../services/TVHDataService';
//import '../styles/app.css';

export default class TVHSettings extends Component {

    static STORAGE_TVH_SETTING_KEY = "TVH_SETTINGS";

    constructor(props) {
        super(props);

        this.state = {
            tvhUrl: "http://",
            streamProfile: "pass",
            isValid: false,
            isLoading: false
            // TODO user password
        }

        this.testResult = "";
    }

    /**
     * Update state from input change
     * 
     * @param {Event} event 
     */
    handleInputChange(event) {
        event.preventDefault();

        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // if url changes we reset test result
        if (name === "tvhUrl") {
            this.testResult = "";
        }
        // update state
        this.setState((state, props) => ({
            [name]: value
        }));
    }

    handleConnectionTest(event) {
        event.preventDefault();
        this.setState((state, props) => ({
            isLoading: true
        }));
        //test url verify if it works
        new TVHDataService(this.state).retrieveServerInfo((result) => {
            this.testResult = "Connected to version: " + result.sw_version;
            this.setState((state, props) => ({
                isLoading: false
            }))
            // put to storage
            localStorage.setItem(TVHSettings.STORAGE_TVH_SETTING_KEY, JSON.stringify({
                tvhUrl: this.state.tvhUrl,
                streamProfile: this.state.streamProfile,
                isValid: true
            }));
            // unmount
            setTimeout(this.props.handleUnmountSettings, 2000);
        },
            (error) => {
                this.testResult = "Failed to retrieve server info";
                this.setState((state, props) => ({
                    isLoading: false
                }))
            });
    }

    componentDidMount() {
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleConnectionTest = this.handleConnectionTest.bind(this);
        // read state from storage if exists
        let settings = localStorage.getItem(TVHSettings.STORAGE_TVH_SETTING_KEY);
        if (settings) {
            this.setState((state, props) => (JSON.parse(settings)));
        }
    }

    componentDidUpdate(prevProps) {
    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div id="tvh-settings" ref="tvhsettings" tabIndex='-1' className="tvhSettings">
                <h1>TVheadend Settings</h1>
                <form onSubmit={this.handleConnectionTest}>
                    <div className="row">
                        <div className="col-25"><label>URL</label></div>
                        <div className="col-75">
                            <Input
                                name="tvhUrl"
                                value={this.state.tvhUrl}
                                onChange={this.handleInputChange}
                                size={SIZE.large}
                                placeholder="http://192.168.0.10:9981/"
                                clearable />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-25"></div>
                        <div className="col-75">
                            <Button onClick={this.handleConnectionTest} size={SIZE.large} kind={KIND.secondary} isLoading={this.state.isLoading}>Verify</Button>
                        </div>
                    </div>
                    {this.testResult.length > 0 &&
                        <div className="row">
                            <div className="col-25"></div>
                            <div className="col-75">
                                <label>{this.testResult}</label>
                            </div>
                        </div>}
                    {/*
                <div className="row">
                    <div className="col-25"><label>Stream Profile</label></div>
                    <div className="col-75">
                        <Input name="streamProfile"
                               value={this.state.streamProfile}
                               onChange={this.handleInputChange}
                               placeholder="pass" 
                               clearable />
                    </div>
                </div>
                */}
                </form>
            </div>
        );
    }
}