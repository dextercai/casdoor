// Copyright 2021 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import {Link} from "react-router-dom";
import {Button, Popconfirm, Switch, Table} from 'antd';
import moment from "moment";
import * as Setting from "./Setting";
import * as SyncerBackend from "./backend/SyncerBackend";
import i18next from "i18next";

class SyncerListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      syncers: null,
      total: 0,
    };
  }

  UNSAFE_componentWillMount() {
    this.getSyncers(1, 10);
  }

  getSyncers(page, pageSize) {
    SyncerBackend.getSyncers("admin", page, pageSize)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            syncers: res.data,
            total: res.data2
          });
        }
      });
  }

  newSyncer() {
    const randomName = Setting.getRandomName();
    return {
      owner: "admin",
      name: `syncer_${randomName}`,
      createdTime: moment().format(),
      organization: "built-in",
      type: "Database",
      host: "localhost",
      port: 3306,
      user: "root",
      password: "123456",
      database: "dbName",
      table: "tableName",
      tableColumns: [],
      affiliationTable: "",
      avatarBaseUrl: "",
      syncInterval: 1,
      isEnabled: true,
    }
  }

  addSyncer() {
    const newSyncer = this.newSyncer();
    SyncerBackend.addSyncer(newSyncer)
      .then((res) => {
          Setting.showMessage("success", `Syncer added successfully`);
          this.setState({
            syncers: Setting.prependRow(this.state.syncers, newSyncer),
            total: this.state.total + 1
          });
          this.props.history.push(`/syncers/${newSyncer.name}`);
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Syncer failed to add: ${error}`);
      });
  }

  deleteSyncer(i) {
    SyncerBackend.deleteSyncer(this.state.syncers[i])
      .then((res) => {
          Setting.showMessage("success", `Syncer deleted successfully`);
          this.setState({
            syncers: Setting.deleteRow(this.state.syncers, i),
            total: this.state.total - 1
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Syncer failed to delete: ${error}`);
      });
  }

  renderTable(syncers) {
    const columns = [
      {
        title: i18next.t("general:Organization"),
        dataIndex: 'organization',
        key: 'organization',
        width: '120px',
        sorter: (a, b) => a.organization.localeCompare(b.organization),
        render: (text, record, index) => {
          return (
            <Link to={`/organizations/${text}`}>
              {text}
            </Link>
          )
        }
      },
      {
        title: i18next.t("general:Name"),
        dataIndex: 'name',
        key: 'name',
        width: '150px',
        fixed: 'left',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <Link to={`/syncers/${text}`}>
              {text}
            </Link>
          )
        }
      },
      {
        title: i18next.t("general:Created time"),
        dataIndex: 'createdTime',
        key: 'createdTime',
        width: '180px',
        sorter: (a, b) => a.createdTime.localeCompare(b.createdTime),
        render: (text, record, index) => {
          return Setting.getFormattedDate(text);
        }
      },
      {
        title: i18next.t("provider:Type"),
        dataIndex: 'type',
        key: 'type',
        width: '100px',
        sorter: (a, b) => a.type.localeCompare(b.type),
      },
      {
        title: i18next.t("provider:Host"),
        dataIndex: 'host',
        key: 'host',
        width: '120px',
        sorter: (a, b) => a.host.localeCompare(b.host),
      },
      {
        title: i18next.t("provider:Port"),
        dataIndex: 'port',
        key: 'port',
        width: '100px',
        sorter: (a, b) => a.port - b.port,
      },
      {
        title: i18next.t("general:User"),
        dataIndex: 'user',
        key: 'user',
        width: '120px',
        sorter: (a, b) => a.user.localeCompare(b.user),
      },
      {
        title: i18next.t("general:Password"),
        dataIndex: 'password',
        key: 'password',
        width: '120px',
        sorter: (a, b) => a.password.localeCompare(b.password),
      },
      {
        title: i18next.t("syncer:Database"),
        dataIndex: 'database',
        key: 'database',
        width: '120px',
        sorter: (a, b) => a.database.localeCompare(b.database),
      },
      {
        title: i18next.t("syncer:Table"),
        dataIndex: 'table',
        key: 'table',
        width: '120px',
        sorter: (a, b) => a.table.localeCompare(b.table),
      },
      {
        title: i18next.t("syncer:Sync interval"),
        dataIndex: 'syncInterval',
        key: 'syncInterval',
        width: '120px',
        sorter: (a, b) => a.syncInterval.localeCompare(b.syncInterval),
      },
      {
        title: i18next.t("syncer:Is enabled"),
        dataIndex: 'isEnabled',
        key: 'isEnabled',
        width: '120px',
        sorter: (a, b) => a.isEnabled - b.isEnabled,
        render: (text, record, index) => {
          return (
            <Switch disabled checkedChildren="ON" unCheckedChildren="OFF" checked={text} />
          )
        }
      },
      {
        title: i18next.t("general:Action"),
        dataIndex: '',
        key: 'op',
        width: '170px',
        fixed: (Setting.isMobile()) ? "false" : "right",
        render: (text, record, index) => {
          return (
            <div>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => this.props.history.push(`/syncers/${record.name}`)}>{i18next.t("general:Edit")}</Button>
              <Popconfirm
                title={`Sure to delete syncer: ${record.name} ?`}
                onConfirm={() => this.deleteSyncer(index)}
              >
                <Button style={{marginBottom: '10px'}} type="danger">{i18next.t("general:Delete")}</Button>
              </Popconfirm>
            </div>
          )
        }
      },
    ];

    const paginationProps = {
      total: this.state.total,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: () => i18next.t("general:{total} in total").replace("{total}", this.state.total),
      onChange: (page, pageSize) => this.getSyncers(page, pageSize),
      onShowSizeChange: (current, size) => this.getSyncers(current, size),
    };

    return (
      <div>
        <Table scroll={{x: 'max-content'}} columns={columns} dataSource={syncers} rowKey="name" size="middle" bordered pagination={paginationProps}
               title={() => (
                 <div>
                   {i18next.t("general:Syncers")}&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" onClick={this.addSyncer.bind(this)}>{i18next.t("general:Add")}</Button>
                 </div>
               )}
               loading={syncers === null}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        {
          this.renderTable(this.state.syncers)
        }
      </div>
    );
  }
}

export default SyncerListPage;