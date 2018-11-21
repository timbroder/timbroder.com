---
author: tim
comments: true
date: 2012-09-10 23:32:42+00:00
dsq_thread_id: '839042026'
layout: post
link: ''
slug: ios-multiple-lines-of-text-in-a-uitableviewcell
title: 'iOS: Multiple Lines of Text in a UITableViewCell'
wordpress_id: 1237
categories:
- Code
tags:
- ios
---

Have you ever wanted to display multiple lines of text in your Table Cell?
It's easy to do in your UITableViewController. 

![](/images/2012/09/2012-09-10_1921.png)

First, let's define the type of font we're going to use. We'll need this in 2 places: 

```c
*)fontForCell { return [UIFont boldSystemFontOfSize:18.0]; } [/c] 
```

Next, calculate the height of the cell by using the height of a Label: 

```c
- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSString *cellText = /* get your text */;
    UIFont *cellFont = [self fontForCell];
    CGSize constraintSize = CGSizeMake(280.0f, MAXFLOAT);
    CGSize labelSize = [cellText sizeWithFont:cellFont constrainedToSize:constraintSize lineBreakMode:UILineBreakModeWordWrap];
    
    return labelSize.height + 20;
}
```

Finally, we'll set some attributes on the cell itself to change the height and
tell the text to wrap:

```c
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @&quot;MyIdentifier&quot;;
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
        cell.textLabel.lineBreakMode = UILineBreakModeWordWrap;
        cell.textLabel.numberOfLines = 0;
        cell.textLabel.font = [self fontForCell];
    }
    [cell.textLabel setText:/* get your text */;];
    cell.accessoryType = UITableViewCellAccessoryDisclosureIndicator;
    return cell;
}
```