export interface SlackAnswer {
    ok:                    boolean;
    messages:              Message[];
    has_more:              boolean;
    pin_count:             number;
    channel_actions_ts:    null;
    channel_actions_count: number;
}

export interface Message {
    bot_id?:      BotID;
    type:         MessageType;
    text:         string;
    user:         Inviter;
    ts:           string;
    team?:        Team;
    bot_profile?: BotProfile;
    attachments?: Attachment[];
    subtype?:     string;
    inviter?:     Inviter;
}

export interface Attachment {
    author_name?:    string;
    author_subname?: string;
    callback_id?:    string;
    fallback:        string;
    title?:          string;
    id:              number;
    title_link?:     string;
    color?:          string;
    actions?:        Action[];
    mrkdwn_in?:      string[];
    text?:           string;
}

export interface Action {
    id:           string;
    text:         Text;
    type:         ActionType;
    style?:       string;
    url?:         string;
    name?:        string;
    data_source?: string;
    options?:     Option[];
}

export interface Option {
    text:  string;
    value: string;
}

export enum Text {
    MoreActions = "More actions…",
    ViewTaskInAsana = "View task in Asana",
}

export enum ActionType {
    Button = "button",
    Select = "select",
}

export enum BotID {
    B012Hfltuh1 = "B012HFLTUH1",
}

export interface BotProfile {
    id:      BotID;
    deleted: boolean;
    name:    Name;
    updated: number;
    app_id:  AppID;
    icons:   Icons;
    team_id: Team;
}

export enum AppID {
    Aa16Lbch2 = "AA16LBCH2",
}

export interface Icons {
    image_36: string;
    image_48: string;
    image_72: string;
}

export enum Name {
    Asana = "Asana",
}

export enum Team {
    Thxaz1Ybw = "THXAZ1YBW",
}

export enum Inviter {
    U012Ah9987Q = "U012AH9987Q",
    U012G20Neuv = "U012G20NEUV",
    Uj1Ek7Sj3 = "UJ1EK7SJ3",
}

export enum MessageType {
    Message = "message",
}
