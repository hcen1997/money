import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import { RichSimulatorStyle, MySwitch } from './RichSimulatorStyle';
import Badge from '@material-ui/core/Badge';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';


class RichSimulator extends React.Component {
  constructor(props) {
    super(props);
    const money = 1000000

    this.all_items = require('../static/goods.json')['items'];
    this.items = this.all_items
    this.items.sort((a, b) => a.price - b.price)
    const itemsNumTmp = {};
    this.items.forEach(item => {
      itemsNumTmp[item.name] = 0;
    });
    this.state = {
      profitPerSec: 0,
      isMakingProfit: false,
      money: money,
      tabValue: 0,
      balance: money,
      itemsNum: itemsNumTmp,
      count: 0,
      isDrawerOpen: false,
      type : 'tbw'
    };
    this.nametoprice = {}
    this.delay = 1000
    this.items.forEach(item => {
      this.nametoprice[item.name] = item.price;
    });


    // 过滤类型
//    let new_items = []
//    this.items.forEach(item => {
//        if ( item["type"] !=undefined && item["type"] == this.state.type){
//            new_items.push(item)
//        }
//    });
//    this.items  = new_items
    this.filter_type()
  }

  filter_type = () =>{
    let new_items = []
    this.all_items.forEach(item => {
        if ( item["type"] !=undefined && item["type"] == this.state.type){
            new_items.push(item)
        }
    });
    this.items  = new_items
  }

  a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  onNumberChange = (target) => {
    const itemname = target.id;
    if (!target.value || target.value == 0) { // 值为空
      target.value = 0;
    } else if (target.value[0] == 0 || target.value[0] == '-') { // 值为负数
      target.value = target.value.substr(1)
    }
    let itemnumber = target.value;

    // 计算物品数量为输入值时的总余额
    let currBalance = this.state.balance - (itemnumber - this.state.itemsNum[itemname]) * this.nametoprice[itemname];

    if (currBalance < 0) {
      // 如果物品数量为输入值时的总余额小于0， 计算当前物品数量余额大于0的情况下的最大值
      let exceptcurr = this.state.balance + this.state.itemsNum[itemname] * this.nametoprice[itemname] // 如果不买当前物品，还剩多少钱
      itemnumber = Math.floor(exceptcurr / this.nametoprice[itemname]);
      target.value = itemnumber;
      currBalance = exceptcurr - this.nametoprice[itemname] * itemnumber
    }

    this.setState({
      count: this.state.count + (itemnumber - this.state.itemsNum[itemname]),
      itemsNum: {
        ...this.state.itemsNum,
        [itemname]: itemnumber
      },
      balance: currBalance,
    })
  }

  handleYuebao = (event) => {
    this.setState({ isMakingProfit: event.target.checked })
    if (event.target.checked) {
      this.yuebaoInterval = setInterval(() => {
        // Your custom logic here
        this.makeProfit()
      }, this.delay);
    } else {
      clearInterval(this.yuebaoInterval)
    }
  }
  changeItem = (type_name) => {
        this.setState({ type : type_name })
        this.filter_type()
  }
  makeProfit = () => {
    const pps = Math.floor(this.state.balance * 0.00000000079)
    this.setState({ balance: this.state.balance + pps, profitPerSec: pps, money: this.state.money + pps });
  }

  handleTabChange = (event, newValue) => {
    this.setState({ tabValue: newValue });
  }
  toggleDrawer = open => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.setState({ isDrawerOpen: open })
  }

  render() {
    const { isMakingProfit, profitPerSec, balance, itemsNum } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.root} >
        <SwipeableDrawer
          anchor="right"
          open={this.state.isDrawerOpen}
          onClose={this.toggleDrawer(false)}
          onOpen={this.toggleDrawer(true)}
        >
          <Grid container justify="center">
            <List className={classes.shopList}>

              <ListSubheader component="div" id="nested-list-subheader">
                我买过的东西
          </ListSubheader>
              {
                this.state.count === 0 ? <Typography className={classes.emptyLabel}>从来没有买过东西</Typography> : null
              }
              {
                this.items.map(item => (itemsNum[item.name] == 0 ? null :
                  <ListItem key={item.name}>
                    <ListItemAvatar>
                      <Avatar src={require(`../static/images/items/${item.name}.jpg`)}></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={item.name} secondary={'数量: ' + itemsNum[item.name]} />
                    <ButtonGroup color="primary" aria-label="outlined primary button group">
                      <Button size="small" onClick={e => {
                        const target = document.getElementById(item.name);
                        target.value = 0;
                        this.onNumberChange(target)
                      }}>删除</Button>
                      <Button size="small" onClick={e => {
                        const target = document.getElementById(item.name);
                        target.value = parseInt(document.getElementById(item.name).value) - 1;
                        this.onNumberChange(target)
                      }}>-</Button>
                      <Button size="small" onClick={e => {
                        const target = document.getElementById(item.name);
                        target.value = parseInt(document.getElementById(item.name).value) + 1;
                        this.onNumberChange(target)
                      }}>+</Button>
                    </ButtonGroup>
                  </ListItem>
                ))
              }
            </List>
          </Grid>

        </SwipeableDrawer>
        <Grid container alignItems='center' justify='space-between' className={classes.appbar}>
          <Grid item>
            <Typography variant="h6" className={classes.balance}>
              钱包里余额  ￥{this.numberWithCommas(balance)}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton aria-label="cart" onClick={this.toggleDrawer(true)}>
              <Badge badgeContent={this.state.count} color="secondary">

                <Typography variant="body2" className={classes.balance}>
                  购买历史
                </Typography>
              </Badge>
            </IconButton>
            {/* <Button variant='outlined' color='secondary'>买了什么</Button> */}
          </Grid>


        </Grid>
        <main>
          <Container className={classes.container} maxWidth="md">
            <Paper className={classes.topPaper}>
              <Grid container justify="center" alignItems="center">
                <Box className={classes.wordsWrapper}>
                  <Typography variant="h3" className={classes.largewords}>花钱模拟器</Typography>
                  <Typography className={classes.footerText}>如何花光这么多钱? bug还是天道? </Typography>
                  <Typography className={classes.smallText}>Inspired by <a href="https://www.taptap.com/app/241942">花钱模拟器</a>
                  </Typography>
                </Box>
              </Grid>
            </Paper>
            <Paper className={classes.yuebaoPaper}>
            <Button variant="outlined" onClick={() => {    this.changeItem('tbw')  }}> 淘宝网</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="outlined" onClick={() => {    this.changeItem('mc')  }}> 买车</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="outlined" onClick={() => {    this.changeItem('mf')  }}> 买房</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="outlined" onClick={() => {    this.changeItem('gxm')  }}> 搞项目</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="outlined" onClick={() => {    this.changeItem('qqg')  }}> 全球购</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="outlined" onClick={() => {    this.changeItem('hs')  }}> 黑市</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <FormControlLabel
                className={classes.yuebaoLabel}
                control={
                  <MySwitch
                    checked={isMakingProfit}
                    onChange={this.handleYuebao}
                    value="checkedB"
                  />
                }
                label="憋不住了, 赚钱"
              />

              {(isMakingProfit ? <span>每秒收益：{profitPerSec}元</span> : null)}

            </Paper>

            <Grid className={classes.cardGrid} container spacing={3}>
              {
                this.items.map(item => (
                  <Grid item key={item.name} xs={12} sm={6} md={3}>
                    <Card className={classes.card}>
                      <CardMedia
                        className={classes.cardMedia}
                        image={require(`../static/images/items/${item.name}.jpg`)}
                        title={item.name}
                      />
                      <CardContent className={classes.cardContent}>
                      <Typography className={classes.price}>
                          ￥<b>{item.price}</b>
                        </Typography>
                        <Typography >
                          {item.name}
                        </Typography>

                      </CardContent>
                      <CardActions className={classes.cardActions}>
                        <TextField
                          InputLabelProps={{
                            shrink: true,
                          }}
                          id={item.name}
                          data-itemname={item.name}
                          label="已买数量"
                          type="number"
                          defaultValue='0'
                          className={classes.cardInput}
                          margin="normal"
                          inputProps={{ min: "0", step: "1" }}
                          onChange={(e) => this.onNumberChange(e.target)}
                        />
                        <Button id={item.name} className={classes.addButton} size="small" variant="contained" color="primary" disabled={(balance < item.price)}
                          onClick={e => {
                            const target = document.getElementById(item.name);
                            target.value = parseInt(document.getElementById(item.name).value) + 1;
                            this.onNumberChange(target)
                          }}>
                          买一个
                                      </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              }
            </Grid>
          </Container>
        </main>
      </div >
    );
  }

}

export default withStyles(RichSimulatorStyle)(RichSimulator);