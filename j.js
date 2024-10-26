let successfulPort=14250;


async function findOpenPort() {
    for (let port = 14250; port <= 14300; port++) {
        const portStatus = await checkPort(port);
        if (portStatus !== null) {
            successfulPort = portStatus;
            console.log(`成功的端口是: ${successfulPort}`); 
            break;
        }
    }

    if (successfulPort === null) {
        console.log("没有找到可访问的端口。");
    }
}
async function checkPort(port) {
    try {
        const response = await fetch(`http://127.0.0.1:${successfulPort}/base/ping`);
        if (response.ok) {
            return port;
        }
    } catch (error) {
    }
    return null;
}
async function getUserInfo() {
    try {
        const response = await fetch(`http://127.0.0.1:${successfulPort}/auth/userinfo`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.code === 0) {
            const { username, userId } = result.data;
            console.log(`Username: ${username}, UserId: ${userId}`);

            return { username, userId };
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}
async function getPermissionInfo() {
    try {
        const response = await fetch(`http://127.0.0.1:${successfulPort}/auth/permission`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.code === 0) {
            const permissions = result.data;
            permissions.forEach(permission => {
                const { permissionId, usageDeadline } = permission;
                console.log(`Permission ID: ${permissionId}, Usage Deadline: ${usageDeadline}`);
            });
            return permissions.map(({ permissionId, usageDeadline }) => ({ permissionId, usageDeadline }));
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching permission info:', error);
    }
}
async function getRoleInfo() {
    try {
        const response = await fetch(`http://127.0.0.1:${successfulPort}/auth/role`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.code === 0) {
            const roleId = result.data.roleId;
            
            const roleMap = {
                0: 'SuperAdmin',
                1: 'Admin',
                2: 'Reseller',
                3: 'User',
                4: 'User_Relax',
                5: 'Banned'
            };
            const roleName = roleMap[roleId] || 'Unknown Role';
            console.log(`Role ID: ${roleId}, Role Name: ${roleName}`);
            return roleName;
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching role info:', error);
    }
}
async function getWalletBalance() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/wallet/balance/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.code === 0) {
            const balance = result.data;
            console.log(`Wallet Balance: ${balance}`);
            return balance;
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching wallet balance:', error);
    }
}

async function displayMeInformation() {
    try {
        const userInfo = await getUserInfo();
        const permissionInfo = await getPermissionInfo();
        const roleName = await getRoleInfo();
        const balance = await getWalletBalance();
        const meInfoDiv = document.querySelector('.Me_Information');
        meInfoDiv.innerHTML = '';
        const card = document.createElement('mdui-card');
        card.className = 'Me_Information_Card';
        card.setAttribute('variant', 'outlined');
        const h1 = document.createElement('h1');
        h1.className = 'Title_Sub_Low_Top';
        h1.textContent = userInfo.username;
        const mduiList = document.createElement('mdui-list');
        const roleItem = document.createElement('mdui-list-item');
        roleItem.setAttribute('headline', `权限等级: ${roleName}`);
        const balanceItem = document.createElement('mdui-list-item');
        balanceItem.setAttribute('headline', '账户余额:');
        balanceItem.setAttribute('description', `${balance} RB`);
        const permission = permissionInfo[0];
        const deadlineItem = document.createElement('mdui-list-item');
        deadlineItem.setAttribute('headline', '到期时长:');
        deadlineItem.setAttribute('description', permission.usageDeadline);
        mduiList.appendChild(roleItem);
        mduiList.appendChild(balanceItem);
        mduiList.appendChild(deadlineItem);
        card.appendChild(h1);
        card.appendChild(mduiList);
        meInfoDiv.appendChild(card);
    } catch (error) {
        console.error('Error displaying user information:', error);
    }
}
async function fetchAndDisplayItems() {
    try {
        // 发送 GET 请求
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/balance/items', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        // 检查返回结果的 code 是否为 0
        if (result.code === 0) {
            const items = result.data;
            const shoppingList = document.querySelector('.shopping_list');

            // 清空之前的内容
            shoppingList.innerHTML = '';

            // 遍历每个 item，创建相应的 mdui-list-item
            items.forEach(item => {
                const { itemId, name, description, price } = item;

                // 创建 <mdui-list-item> 元素
                const listItem = document.createElement('mdui-list-item');
                listItem.classList.add('rounded');
                listItem.setAttribute('alignment', 'start');
                listItem.setAttribute('description', `${description} - 价格: ${price} RB`);
                listItem.setAttribute('onclick', `buy_items(${itemId},'${description}',${price})`);
                // 设置标题和内容
                listItem.innerHTML = `
                    ${name}
                    <mdui-icon slot="icon" name="attach_money"></mdui-icon>
                `;

                // 将 listItem 添加到 mdui-list
                shoppingList.appendChild(listItem);
            });
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching items:', error);
    }
}
let Cache_item_id=0;
function buy_items(itemId,description,price) {
    Cache_item_id=itemId;
    const dialog = document.querySelector('.buy_item');
    dialog.description = "你确定要购买"+description+"吗？价格为："+price+"RB";
    dialog.headline="确定购买商品"+itemId+"吗？"
    dialog.open = true;
}
async function buy_items_true(itemId) {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+`/balance/item/purchase/${itemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.code === 0) {
            const msg = result.msg;
            console.log(`购买成功: ${msg}`);
            document.querySelector('.buy_item').open = false;
            document.querySelector('.Quanqian_success').open = true
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching wallet balance:', error);
    }
}
let cache_;
function handleLogin(account, password,deviceID = null, deviceKey = null) {
    let url;
    let data;
    let model;
    model=0;
    if (account.includes('sauth_json')) {
        url = 'http://127.0.0.1:'+successfulPort+'/netease/auth/sauth';
        data = JSON.stringify({ sauth: account });
        model=4562;
    } else if (account.includes('@')) {
        url = 'http://127.0.0.1:'+successfulPort+'/netease/auth/offical';
        data = JSON.stringify({ account: account, password: password,deviceID:deviceID, deviceKey:deviceKey });
        model=163;
    } else {
        url = 'http://127.0.0.1:'+successfulPort+'/netease/auth/4399';
        data = JSON.stringify({ account: account, password: password });
        model=4399;
    }
    console.log(url, data);
    fetch(url, {
        method: 'POST',
        headers: {
            'accept': 'text/plain',
            'Content-Type': 'application/json'
        },
        body: data
    })
    .then(response => response.json())
    .then(return_data => {
        console.log('Success:', return_data);
        let return_data_data=return_data.data;
        console.log('ABCD:',return_data_data);
        cache_deviceID=return_data_data.deviceID;
        cache_deviceKey=return_data_data.deviceKey;
        console.log('ABCFGHGHD:',cache_deviceID);
        if (return_data.code == 0) {
            cache_=JSON.stringify({ account: account, password: password,deviceID:cache_deviceID, deviceKey:cache_deviceKey })
            document.querySelector(".Dialog_Login").open = false;
            const dialog = document.querySelector(".Dialog_Login_Success");
            dialog.open = true;
            insertRemarks();
        } else {
            console.error('Login failed:'+return_data.msg);
        } 
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
function remark_save(remark) {
    let url;
    let data;
    let model;
    model=0;
    console.log(cache_);
    if (cache_ == null) {
        return;
    }
    let cache_account=JSON.parse(cache_);
    if (cache_account.account.includes('sauth_json')) {
        url = 'http://127.0.0.1:'+successfulPort+'/sauth/add';
        let encodedAccount = btoa(cache_account.account);
        data = JSON.stringify({ remark:remark, sauth: encodedAccount });
        model=4562;
    } else if (cache_account.account.includes('@')) {
        url = 'http://127.0.0.1:'+successfulPort+'/official/add';
        console.log(cache_account.deviceID);
        data = JSON.stringify({ remark:remark, account: cache_account.account, password: cache_account.password,deviceID:cache_account.deviceID, deviceKey:cache_account.deviceKey });
        model=163;
    } else {
        url = 'http://127.0.0.1:'+successfulPort+'/4399/add';
        data = JSON.stringify({ remark:remark, account: cache_account.account, password: cache_account.password });
        model=4399;
    }
    console.log(url, data);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        if (data.code == 0) {
            const dialog = document.querySelector(".Dialog_Login_Success");
            dialog.open = false;
        } else {
            console.error('Login failed:'+data.msg);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function reloadData() {
    try {
        const response = fetch('http://127.0.0.1:'+successfulPort+'/reload');
        const data = response.json();
        
        if (data.msg !== 'Success') {
            console.error('Error:', data.msg);
        }
    } catch (error) {
        console.error('Failed to fetch reload data:', error);
    }
}

let officialData = [];
async function fetchOfficialData() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/official/get');
        const data = await response.json();

        if (data.code === 0) {
            officialData = data.data;
        } else {
            console.error('Failed to fetch official data:', data.msg);
        }
    } catch (error) {
        console.error('Failed to fetch official data:', error);
    }
}

let data4399 = [];
async function fetch4399Data() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/4399/get');
        const data = await response.json();

        if (data.code === 0) {
            data4399 = data.data;
        } else {
            console.error('Failed to fetch 4399 data:', data.msg);
        }
    } catch (error) {
        console.error('Failed to fetch 4399 data:', error);
    }
}

let sauthData = [];
async function fetchSauthData() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/sauth/get');
        const data = await response.json();

        if (data.code === 0) {
            sauthData = data.data;
        } else {
            console.error('Failed to fetch sauth data:', data.msg);
        }
    } catch (error) {
        console.error('Failed to fetch sauth data:', error);
    }
}
let combinedData=[];
async function insertRemarks() {
    await Promise.all([fetchOfficialData(), fetch4399Data(), fetchSauthData()]);

    combinedData = [...officialData, ...data4399, ...sauthData];

    const selectElement = document.querySelector('.Account_multiple');
    selectElement.innerHTML = '';
    console.log(combinedData);
    combinedData.forEach(item => {
        const option = document.createElement('mdui-menu-item');
        option.value = item.remark;
        option.textContent = item.remark;
        selectElement.appendChild(option);
    });
}
let cache_deviceID="";
let cache_deviceKey="";
reloadData();
async function compareAndPost(compareArray) {
    const loginResults = [];
    for (const compareItem of compareArray) {
        const match = combinedData.find(item => item.remark === compareItem);

        if (match) {
            let postUrl = '';
            let postData = {};
            let remark = match.remark;

            // 判断数据来源是 official, 4399 还是 sauth
            if (officialData.includes(match)) {
                model='official';
                postUrl = 'http://127.0.0.1:'+successfulPort+'/netease/auth/offical';
                postData = {
                    account: match.account,
                    password: match.password,
                    deviceID: match.deviceId,
                    deviceKey: match.deviceKey
                };
            } else if (data4399.includes(match)) {
                postUrl = 'http://127.0.0.1:'+successfulPort+'/netease/auth/4399';
                postData = {
                    account: match.account,
                    password: match.password
                };
            } else if (sauthData.includes(match)) {
                postUrl = 'http://127.0.0.1:'+successfulPort+'/netease/auth/sauth';
                postData = {
                    sauth: atob(match.sauth) // Base64 解密
                };
            }

            // 如果有匹配的 URL 和数据，发送 POST 请求
            if (postUrl && postData) {
                try {
                    const response = await fetch(postUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(postData)
                    });

                    const result = await response.json();

                    if (result.code === 0) {
                        loginResults.push({ remark: remark, status: '成功' });
                    } else {
                        loginResults.push({ remark: remark, status: '失败' });
                    }
                } catch (error) {
                    console.error('POST request failed:', error);
                    loginResults.push({ remark: remark, status: '失败' });
                }
            }
        }
    }

    const successRemarks = loginResults.filter(item => item.status === '成功').map(item => item.remark);
    const failedRemarks = loginResults.filter(item => item.status === '失败').map(item => item.remark);
    const dialogDescription = document.getElementById('Login_return');
    if (failedRemarks.length === 0) {
        dialogDescription.textContent = `以下账号成功登录：${successRemarks.join(', ')}`;
    } else {
        dialogDescription.textContent = `登录成功的账号：${successRemarks.join(', ')}\n登录失败的账号：${failedRemarks.join(', ')}`;
    }
    if (successRemarks.length > 0) {
        fetchAccounts();
        loadNetworkList();
    }
    const dialog = document.querySelector('.Dialog_Account_Login_Success');
    dialog.open = true;
}
async function fetchAccounts() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/manager/netease/account');
        const data = await response.json();

        if (data.code === 0) {
            const accountList = document.getElementById('Account_Have_Signed_List').querySelector('mdui-collapse');
            accountList.innerHTML = ''; // 清空现有内容

            data.data.forEach(account => {
                const entityId = account.entityId;

                const collapseItem = document.createElement('mdui-collapse-item');
                collapseItem.innerHTML = `
                    <mdui-list-item slot="header" icon="account_circle">账户 ${entityId}</mdui-list-item>
                    <div style="margin-left: 2.5rem">
                        <mdui-list-item onclick="switchAccount('${entityId}')">切换到该账号</mdui-list-item>
                        <mdui-list-item onclick="logoutAccount('${entityId}')">退出登录</mdui-list-item>
                    </div>
                `;
                
                // 将collapse item添加到collapse中
                accountList.appendChild(collapseItem);
            });
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

function switchAccount(entityId) {
    fetch('http://127.0.0.1:'+successfulPort+'/manager/netease/account/select/'+entityId)
        .then(response => response.json())
        .then(data => {
            console.log('Switched account:', data);
            const dialog = document.querySelector(".switch_successful");
            dialog.open = true;
        })
        .catch(error => console.error('Error switching account:', error));
}

function logoutAccount(entityId) {
    fetch('http://127.0.0.1:'+successfulPort+'/manager/netease/account/remove/'+entityId)
        .then(response => response.json())
        .then(data => {
            console.log('Logged out account:', data);
            fetchAccounts();
        })
        .catch(error => console.error('Error logging out account:', error));
}
cache_server_entityID="";
function open_add_dialog() {
     const dialog = document.querySelector(".Dialog_Add_Name");
     dialog.open = true;
}
// function opendialog(entityId) {
//     cache_server_entityID=entityId;
//     const dialog = document.querySelector(".Dialog_Select");
//     dialog.open = true;
// }
async function opendialog(entityId) {
    cache_server_entityID = entityId;

    const requestData = {
        offset: 0,
        length: 3,
        Game_id: entityId
    };

    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/netgame/list', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.code === 0) {
            const namesList = data.data
                .filter(item => item.expire_time === 0)
                .map(item => ({ name: item.name, entity_id: item.entity_id }));

            const selectElement = document.querySelector(".Dialog_Select_Select");

            selectElement.innerHTML = '';

            namesList.forEach(({ name, entity_id }) => {
                const option = document.createElement('mdui-menu-item');
                option.setAttribute('value', entity_id);
                option.textContent = name;
                selectElement.appendChild(option);
            });

            // 打开对话框
            const dialog = document.querySelector(".Dialog_Select");
            dialog.open = true;
        } else {
            console.error("服务器返回错误: ", data.msg);
        }
    } catch (error) {
        console.error("请求失败: ", error);
    }
}
async function random_add() {
    let characterName=generateRandomChineseName();
    if (!characterName) {
        console.error("请输入角色名");
        return;
    }

    const requestData = {
        name: characterName,
        game_id: cache_server_entityID
    };

    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/netgame/add', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.code === 0) {


            const requestData = {
                offset: 0,
                length: 3,
                Game_id: cache_server_entityID
            };
        
            try {
                const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/netgame/list', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
        
                const data = await response.json();
        
                if (data.code === 0) {
                    const namesList = data.data
                        .filter(item => item.expire_time === 0)
                        .map(item => ({ name: item.name, entity_id: item.entity_id }));
        
                    const selectElement = document.querySelector(".Dialog_Select_Select");
        
                    selectElement.innerHTML = '';
        
                    namesList.forEach(({ name, entity_id }) => {
                        const option = document.createElement('mdui-menu-item');
                        option.setAttribute('value', entity_id);
                        option.textContent = name;
                        selectElement.appendChild(option);
                    });
        
                    // 打开对话框
                    const dialog = document.querySelector(".Dialog_Select");
                    dialog.open = true;
                } else {
                    console.error("服务器返回错误: ", data.msg);
                }
            } catch (error) {
                console.error("请求失败: ", error);
            }
        } else {
            console.error("操作失败: " + data.msg);
        }
    } catch (error) {
        console.error("请求失败: ", error);
    }
}
async function add_net_name(characterName) {

    if (!characterName) {
        console.error("请输入角色名");
        return;
    }

    const requestData = {
        name: characterName,
        game_id: cache_server_entityID
    };

    try {
        const response = await fetch("http://127.0.0.1:14250/netease/character/netgame/add", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.code === 0) {
            const dialog = document.querySelector(".Dialog_Add_Name");
            dialog.open = false;

            const requestData = {
                offset: 0,
                length: 3,
                Game_id: cache_server_entityID
            };
        
            try {
                const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/netgame/list', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
        
                const data = await response.json();
        
                if (data.code === 0) {
                    const namesList = data.data
                        .filter(item => item.expire_time === 0)
                        .map(item => ({ name: item.name, entity_id: item.entity_id }));
        
                    const selectElement = document.querySelector(".Dialog_Select_Select");
        
                    selectElement.innerHTML = '';
        
                    namesList.forEach(({ name, entity_id }) => {
                        const option = document.createElement('mdui-menu-item');
                        option.setAttribute('value', entity_id);
                        option.textContent = name;
                        selectElement.appendChild(option);
                    });
        
                    // 打开对话框
                    const dialog = document.querySelector(".Dialog_Select");
                    dialog.open = true;
                } else {
                    console.error("服务器返回错误: ", data.msg);
                }
            } catch (error) {
                console.error("请求失败: ", error);
            }
        } else {
            console.error("操作失败: " + data.msg);
        }
    } catch (error) {
        console.error("请求失败: ", error);
    }
}
function generateRandomChineseName(length = 6) {
    let name = 'Pr_';
    for (let i = 0; i < length; i++) {
        const unicodeNum = Math.floor(Math.random() * (0x9FA5 - 0x4E00 + 1)) + 0x4E00;
        name += String.fromCharCode(unicodeNum);
    }
    return name;
}
async function fetchData(offset, length) {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/item/netgame/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ offset: offset, length: length })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.code === 0) {
                return result.data;
            } else {
                console.error('Error:', result.msg);
            }
        } else {
            console.error('Network response was not ok.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function updateNetworkList(data) {
    const networkList = document.getElementById('Network_List_List');

    const collapseWrapper = document.createElement('mdui-collapse');
    collapseWrapper.setAttribute('accordion', '');

    data.forEach((item) => {
        const collapseItem = document.createElement('mdui-collapse-item');
        const listItemHeader = document.createElement('mdui-list-item');
        listItemHeader.setAttribute('slot', 'header');
        listItemHeader.setAttribute('icon', 'near_me');
        listItemHeader.textContent = item.name;
        collapseItem.appendChild(listItemHeader);

        const contentDiv = document.createElement('div');
        contentDiv.style.marginLeft = '2.5rem';

        const listItem = document.createElement('mdui-list-item');
        listItem.setAttribute('onclick', `opendialog('${item.entity_id}')`);

        const card = document.createElement('mdui-card');
        card.classList.add('Netword_Card');

        const title = document.createElement('h1');
        title.classList.add('Title_Sub_No_Header');
        title.textContent = item.name;
        card.appendChild(title);

        const entityID = document.createElement('h1');
        entityID.classList.add('Title_Sub_Small');
        entityID.textContent = `EntityID: ${item.entity_id}`;
        card.appendChild(entityID);

        const summary = document.createElement('h1');
        summary.classList.add('Title_Sub_Small');
        summary.innerHTML = item.brief_summary;
        card.appendChild(summary);

        const onlineCount = document.createElement('h1');
        onlineCount.classList.add('Title_Sub_Small');
        onlineCount.textContent = `在线人数: ${item.online_count}`;
        card.appendChild(onlineCount);

        listItem.appendChild(card);
        contentDiv.appendChild(listItem);
        collapseItem.appendChild(contentDiv);
        collapseWrapper.appendChild(collapseItem);
    });

    networkList.appendChild(collapseWrapper);
}

async function loadNetworkList() {
    const length = 50;
    let offset = 0;

    for (let i = 0; i < 4; i++) {
        const data = await fetchData(offset, length);
        if (data) {
            updateNetworkList(data);
        }
        offset += 50;
    }
}

