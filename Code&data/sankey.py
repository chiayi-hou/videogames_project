import plotly.graph_objects as go
import pandas as pd


# putting a _ before the function tells not to public
def _code_mapping(df, src, targ):
        """
        replace data in DataFrame with integer codes so the data can be used to create snakey diagram.
        :param df: DataFrame you want to make into snakey diagram
        :param src: (string). The name of the source column.
        :param targ: (string). The name of the target column.
        :return: - df (DataFrame): dataframe with information replaced with code
                 - labels (list): a list of all labels in source and target
        """
        # get the distinct labels from src/targ columns
        labels = list(set(list(df[src]) + list(df[targ])))

        # generate n integers for n labels
        codes = list(range(len(labels)))

        # create a map (dictionary) from label to code
        lc_map = dict(zip(labels, codes))

        # substitute names for codes in the dataframe
        # this creates a new df. replace({been_replaced:to replace})
        df = df.replace({src:lc_map, targ:lc_map})

        return df, labels

def make_sankey(df, cols, vals=None, **kwargs):
        """
        Create a snakey diagram with given dataframe
        :param df: (DataFrame). A DataFrame with information to make sankey diagram
        :param cols: (list). A list of column names in the DataFrame. Must have at least 2 columns.
        :param vals: (string). The name of the value column in the DataFrame.
        :param kwargs:
        :return: N/A
        """
        # show error message and exit function if not having at least 2 columns.
        if len(cols) < 2:
                print("Error: please input at least 2 columns")
                return

        # create an empty list to store column pairs
        ls_col_pair = []
        # loop through all the columns except the last one
        for idx in range(len(cols) - 1):
                # pair the column and the next one in a list
                pair = [cols[idx], cols[idx+1]]
                # append the list to the ls_col_pair
                ls_col_pair.append(pair)

        # create an empty dataframe to store arranged data
        df_stacked = pd.DataFrame()

        if vals:
                # loop through all the column pairs
                for pair in ls_col_pair:
                        # add the value column to the list
                        pair.append(vals)
                        # get the needed columns
                        df_pair = df[pair]
                        # reset column names
                        df_pair.columns = ['src', 'targ', 'val']
                        # concat the df_pair to the df_stacked
                        df_stacked = pd.concat([df_stacked, df_pair], axis=0)

                # sum up the values in the dataframe for the rows have the same 'src' and 'targ' value
                df_stacked = df_stacked.groupby(['src', 'targ'])['val'].sum().reset_index(name='val')
                # get the value
                values = df_stacked['val']
        else:
                # loop through all the pairs
                for pair in ls_col_pair:
                        # get the needed columns
                        df_pair = df[pair]
                        # rename the columns and concat it to the df_stacked
                        df_pair.columns = ['src', 'targ']
                        df_stacked = pd.concat([df_stacked, df_pair], axis=0)

                # get the values
                values = [1] * len(df_stacked)

        # use the _code_mapping function to map the values to codes
        df_stacked, labels = _code_mapping(df_stacked, 'src', 'targ')
        
        # Create a color scale based on target nodes
        unique_targets = df_stacked['targ'].unique()
        color_scale = dict(zip(unique_targets, ['#4575b4', '#d73027', '#1a9850']))

        # Map target colors to links
        link_colors = df_stacked['targ'].map(color_scale)
        
        node_colors = [link_colors.get(node, 'gray') for node in set(df_stacked['src'].tolist() + df_stacked['targ'].tolist())]

        

        # Create the Sankey diagram
        link = {'source': df_stacked['src'], 'target': df_stacked['targ'], 'value': values,
                'color': link_colors, "line":{'width': 0}}  # Use the mapped colors for links

        # create the sankey diagram
        #link = {'source': df_stacked['src'], 'target': df_stacked['targ'], 'value': values,
        #    'line': {'color': df_stacked['targ'], 'colorscale': 'Viridis', 'width': 0}}
        node_thickness = kwargs.get("node_thickness", 50)
        node = {'label': labels, 'pad': 50, 'thickness': node_thickness,
               'line': {'width': 0}, "color": "lightgray"}

        sk = go.Sankey(link=link, node=node)
        fig = go.Figure(sk)
        return fig